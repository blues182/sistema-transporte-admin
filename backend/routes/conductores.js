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
    const { nombre, apellidos, telefono, licencia, vencimiento_licencia } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO conductores (nombre, apellidos, telefono, licencia, vencimiento_licencia)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellidos, telefono, licencia, vencimiento_licencia]
    );

    res.status(201).json({ id: result.insertId, message: 'Conductor creado exitosamente' });
  } catch (error) {
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

module.exports = router;
