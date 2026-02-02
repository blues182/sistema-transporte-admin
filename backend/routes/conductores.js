const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los conductores
router.get('/', async (req, res) => {
  try {
    const [conductores] = await db.query(
      'SELECT * FROM conductores ORDER BY apellidos, nombre'
    );
    res.json(conductores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener conductor por ID
router.get('/:id', async (req, res) => {
  try {
    const [conductores] = await db.query('SELECT * FROM conductores WHERE id = ?', [req.params.id]);
    if (conductores.length === 0) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }
    res.json(conductores[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo conductor
router.post('/', async (req, res) => {
  try {
    const { nombre, apellidos, telefono, fecha_nacimiento, licencia_federal, estado } = req.body;
    
    // Validación
    if (!nombre || !apellidos || !fecha_nacimiento) {
      return res.status(400).json({ error: 'Nombre, apellidos y fecha de nacimiento son requeridos' });
    }
    
    const [result] = await db.query(
      `INSERT INTO conductores (nombre, apellidos, telefono, fecha_nacimiento, licencia_federal, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos, telefono || null, fecha_nacimiento, licencia_federal || 'no', estado || 'activo']
    );

    res.status(201).json({ id: result.insertId, message: 'Conductor creado exitosamente' });
  } catch (error) {
    console.error('Error al crear conductor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar conductor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE conductores SET ${fields} WHERE id = ?`, values);
    res.json({ message: 'Conductor actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar conductor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM conductores WHERE id = ?', [id]);
    res.json({ message: 'Conductor eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Viajes del conductor
router.get('/:id/viajes', async (req, res) => {
  try {
    const [viajes] = await db.query(
      `SELECT v.*, cl.nombre as cliente_nombre, t.numero_economico
       FROM viajes v
       JOIN clientes cl ON v.cliente_id = cl.id
       JOIN trailers t ON v.trailer_id = t.id
       WHERE v.conductor_id = ?
       ORDER BY v.fecha_salida DESC`,
      [req.params.id]
    );
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pagos del conductor
router.get('/:id/pagos', async (req, res) => {
  try {
    const [pagos] = await db.query(
      'SELECT * FROM pagos_conductores WHERE conductor_id = ? ORDER BY fecha DESC',
      [req.params.id]
    );
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener semana actual según MySQL
router.get('/semana-actual', async (req, res) => {
  try {
    const [result] = await db.query('SELECT WEEK(NOW(), 1) as semana, YEAR(NOW()) as anio');
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener nómina semanal del conductor
router.get('/:id/nomina-semanal', async (req, res) => {
  try {
    const { semana, anio } = req.query;
    
    const [viajes] = await db.query(
      `SELECT 
        v.id,
        v.fecha_salida,
        v.origen,
        v.destino,
        cl.nombre as cliente,
        COALESCE(
          (SELECT SUM(monto) FROM gastos_viaje 
           WHERE viaje_id = v.id 
           AND (LOWER(concepto) LIKE '%sueldo%' OR LOWER(concepto) LIKE '%operador%')), 
          0
        ) as sueldo
       FROM viajes v
       JOIN clientes cl ON v.cliente_id = cl.id
       WHERE v.conductor_id = ?
         AND WEEK(v.fecha_salida, 1) = ?
         AND YEAR(v.fecha_salida) = ?
         AND v.estado = 'completado'
       ORDER BY v.fecha_salida DESC`,
      [req.params.id, semana, anio]
    );
    
    const total = viajes.reduce((sum, v) => sum + parseFloat(v.sueldo || 0), 0);
    
    res.json({ viajes, total });
  } catch (error) {
    console.error('Error al obtener nómina semanal:', error);
    res.status(500).json({ error: error.message });
  }
});

// Registrar pago de nómina
router.post('/:id/pagar-nomina', async (req, res) => {
  try {
    const { conductor_id } = req.params;
    const { semana, anio, monto, metodo_pago, notas } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO pagos_conductores (conductor_id, semana, anio, monto, metodo_pago, notas, fecha)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [conductor_id, semana, anio, monto, metodo_pago || 'efectivo', notas || null]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Pago de nómina registrado exitosamente' 
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener resumen de pagos (todas las semanas)
router.get('/:id/resumen-pagos', async (req, res) => {
  try {
    const [pagos] = await db.query(
      `SELECT 
        semana,
        anio,
        monto,
        metodo_pago,
        fecha,
        notas
       FROM pagos_conductores 
       WHERE conductor_id = ?
       ORDER BY anio DESC, semana DESC
       LIMIT 20`,
      [req.params.id]
    );
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
