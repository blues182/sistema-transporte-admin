const express = require('express');
const router = express.Router();
const db = require('../config/database');

const ESTADO_ACTIVO_POR_TIPO = {
  trailer: 'activo',
  remolque: 'disponible'
};

const TABLA_POR_TIPO = {
  trailer: 'trailers',
  remolque: 'remolques'
};

const CAMPOS_UNIDAD = {
  trailer: 'trailer_id',
  remolque: 'remolque_id'
};

const parseUnidadPayload = (payload) => {
  const unidad_tipo = payload.unidad_tipo || (payload.remolque_id ? 'remolque' : 'trailer');
  const rawUnidadId = payload.unidad_id || payload[CAMPOS_UNIDAD[unidad_tipo]];
  const unidad_id = parseInt(rawUnidadId, 10);
  return { unidad_tipo, unidad_id };
};

const soportaMantenimientoMultiUnidad = async (connection) => {
  const [unidadTipoCols] = await connection.query("SHOW COLUMNS FROM mantenimiento LIKE 'unidad_tipo'");
  const [remolqueCols] = await connection.query("SHOW COLUMNS FROM mantenimiento LIKE 'remolque_id'");
  return unidadTipoCols.length > 0 && remolqueCols.length > 0;
};

// Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const multiUnidad = await soportaMantenimientoMultiUnidad(db);
    const [mantenimientos] = multiUnidad
      ? await db.query(
          `SELECT m.*,
                  COALESCE(m.unidad_tipo, 'trailer') AS unidad_tipo,
                  COALESCE(m.trailer_id, m.remolque_id) AS unidad_id,
                  COALESCE(t.numero_economico, r.numero_remolque) AS numero_economico,
                  t.placas,
                  r.numero_remolque
           FROM mantenimiento m
           LEFT JOIN trailers t ON m.trailer_id = t.id
           LEFT JOIN remolques r ON m.remolque_id = r.id
           ORDER BY m.fecha DESC`
        )
      : await db.query(
          `SELECT m.*, 'trailer' AS unidad_tipo, m.trailer_id AS unidad_id, t.numero_economico, t.placas
           FROM mantenimiento m
           JOIN trailers t ON m.trailer_id = t.id
           ORDER BY m.fecha DESC`
        );
    res.json(mantenimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener mantenimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const multiUnidad = await soportaMantenimientoMultiUnidad(db);
    const [mantenimientos] = multiUnidad
      ? await db.query(
          `SELECT m.*,
                  COALESCE(m.unidad_tipo, 'trailer') AS unidad_tipo,
                  COALESCE(m.trailer_id, m.remolque_id) AS unidad_id,
                  COALESCE(t.numero_economico, r.numero_remolque) AS numero_economico,
                  t.placas,
                  r.numero_remolque
           FROM mantenimiento m
           LEFT JOIN trailers t ON m.trailer_id = t.id
           LEFT JOIN remolques r ON m.remolque_id = r.id
           WHERE m.id = ?`,
          [req.params.id]
        )
      : await db.query(
          `SELECT m.*, 'trailer' AS unidad_tipo, m.trailer_id AS unidad_id, t.numero_economico, t.placas
           FROM mantenimiento m
           JOIN trailers t ON m.trailer_id = t.id
           WHERE m.id = ?`,
          [req.params.id]
        );

    if (mantenimientos.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }

    // Obtener refacciones usadas
    const [refacciones] = await db.query(
      `SELECT mr.*, r.nombre, r.codigo
       FROM mantenimiento_refacciones mr
       JOIN refacciones r ON mr.refaccion_id = r.id
       WHERE mr.mantenimiento_id = ?`,
      [req.params.id]
    );

    res.json({ ...mantenimientos[0], refacciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo mantenimiento
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller, refacciones } = req.body;
    const { unidad_tipo, unidad_id } = parseUnidadPayload(req.body);
    const multiUnidad = await soportaMantenimientoMultiUnidad(connection);

    if (!TABLA_POR_TIPO[unidad_tipo]) {
      return res.status(400).json({ error: 'Tipo de unidad inválido' });
    }

    if (!multiUnidad && unidad_tipo === 'remolque') {
      return res.status(400).json({ error: 'Tu base de datos aun no soporta remolques en mantenimiento. Ejecuta la migracion add_mantenimiento_remolques.sql' });
    }

    if (!Number.isInteger(unidad_id) || unidad_id <= 0) {
      return res.status(400).json({ error: 'ID de unidad inválido' });
    }

    await connection.beginTransaction();

    // Cambiar el estado de la unidad a mantenimiento
    await connection.query(
      `UPDATE ${TABLA_POR_TIPO[unidad_tipo]} SET estado = ? WHERE id = ?`,
      ['mantenimiento', unidad_id]
    );

    const [result] = multiUnidad
      ? await connection.query(
          `INSERT INTO mantenimiento (unidad_tipo, trailer_id, remolque_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            unidad_tipo,
            unidad_tipo === 'trailer' ? unidad_id : null,
            unidad_tipo === 'remolque' ? unidad_id : null,
            fecha,
            tipo,
            descripcion,
            kilometraje,
            costo_mano_obra,
            taller
          ]
        )
      : await connection.query(
          `INSERT INTO mantenimiento (trailer_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [unidad_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller]
        );

    const mantenimientoId = result.insertId;

    // Insertar refacciones usadas y actualizar inventario
    if (refacciones && refacciones.length > 0) {
      for (const ref of refacciones) {
        await connection.query(
          `INSERT INTO mantenimiento_refacciones (mantenimiento_id, refaccion_id, cantidad, precio_unitario)
           VALUES (?, ?, ?, ?)`,
          [mantenimientoId, ref.refaccion_id, ref.cantidad, ref.precio_unitario]
        );

        // Actualizar stock
        await connection.query(
          'UPDATE refacciones SET stock_actual = stock_actual - ? WHERE id = ?',
          [ref.cantidad, ref.refaccion_id]
        );

        // Registrar movimiento
        await connection.query(
          `INSERT INTO movimientos_inventario (refaccion_id, tipo, cantidad, fecha, motivo, referencia)
           VALUES (?, 'salida', ?, ?, ?, ?)`,
          [ref.refaccion_id, ref.cantidad, fecha, 'Mantenimiento', `MANT-${mantenimientoId}`]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ id: mantenimientoId, message: 'Mantenimiento registrado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear mantenimiento:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Actualizar mantenimiento
router.put('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const updates = req.body;
    const multiUnidad = await soportaMantenimientoMultiUnidad(connection);
    
    // Si se está completando el mantenimiento, devolver la unidad a su estado activo
    if (updates.estado === 'completado') {
      const [mant] = multiUnidad
        ? await connection.query(
            `SELECT COALESCE(unidad_tipo, 'trailer') AS unidad_tipo, trailer_id, remolque_id
             FROM mantenimiento
             WHERE id = ?`,
            [id]
          )
        : await connection.query(
            `SELECT 'trailer' AS unidad_tipo, trailer_id, NULL AS remolque_id
             FROM mantenimiento
             WHERE id = ?`,
            [id]
          );
      if (mant.length > 0) {
        const unidad_tipo = mant[0].unidad_tipo;
        const unidad_id = unidad_tipo === 'remolque' ? mant[0].remolque_id : mant[0].trailer_id;
        if (TABLA_POR_TIPO[unidad_tipo] && unidad_id) {
          await connection.query(
            `UPDATE ${TABLA_POR_TIPO[unidad_tipo]} SET estado = ? WHERE id = ?`,
            [ESTADO_ACTIVO_POR_TIPO[unidad_tipo], unidad_id]
          );
        }
      }
    }

    delete updates.unidad_id;
    if (!multiUnidad) {
      delete updates.unidad_tipo;
      delete updates.remolque_id;
    }
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await connection.query(`UPDATE mantenimiento SET ${fields} WHERE id = ?`, values);
    
    await connection.commit();
    res.json({ message: 'Mantenimiento actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar mantenimiento:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Completar mantenimiento
router.post('/:id/completar', async (req, res) => {
  try {
    await db.query(
      `UPDATE mantenimiento SET estado = 'completado' WHERE id = ?`,
      [req.params.id]
    );
    res.json({ message: 'Mantenimiento completado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Costo total del mantenimiento
router.get('/:id/costo-total', async (req, res) => {
  try {
    const [mantenimiento] = await db.query(
      'SELECT costo_mano_obra FROM mantenimiento WHERE id = ?',
      [req.params.id]
    );

    const [refacciones] = await db.query(
      `SELECT SUM(cantidad * precio_unitario) as costo_refacciones
       FROM mantenimiento_refacciones
       WHERE mantenimiento_id = ?`,
      [req.params.id]
    );

    const costo_mano_obra = parseFloat(mantenimiento[0].costo_mano_obra || 0);
    const costo_refacciones = parseFloat(refacciones[0].costo_refacciones || 0);
    const costo_total = costo_mano_obra + costo_refacciones;

    res.json({
      costo_mano_obra,
      costo_refacciones,
      costo_total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
