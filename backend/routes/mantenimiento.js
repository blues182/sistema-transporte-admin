const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const [mantenimientos] = await db.query(
      `SELECT m.*, t.numero_economico, t.placas
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
    const [mantenimientos] = await db.query(
      `SELECT m.*, t.numero_economico, t.placas
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
    const { trailer_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller, refacciones } = req.body;

    await connection.beginTransaction();

    // Cambiar el estado del trailer a mantenimiento
    await connection.query('UPDATE trailers SET estado = ? WHERE id = ?', ['mantenimiento', trailer_id]);

    const [result] = await connection.query(
      `INSERT INTO mantenimiento (trailer_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [trailer_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, taller]
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
    
    // Si se está completando el mantenimiento, cambiar el estado del trailer a activo
    if (updates.estado === 'completado') {
      // Obtener el trailer_id del mantenimiento
      const [mant] = await connection.query('SELECT trailer_id FROM mantenimiento WHERE id = ?', [id]);
      if (mant.length > 0) {
        await connection.query('UPDATE trailers SET estado = ? WHERE id = ?', ['activo', mant[0].trailer_id]);
      }
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
