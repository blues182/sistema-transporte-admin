const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los trailers
router.get('/', async (req, res) => {
  try {
    const [trailers] = await db.query('SELECT * FROM trailers ORDER BY numero_economico');
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trailer por ID
router.get('/:id', async (req, res) => {
  try {
    const [trailers] = await db.query('SELECT * FROM trailers WHERE id = ?', [req.params.id]);
    if (trailers.length === 0) {
      return res.status(404).json({ error: 'Trailer no encontrado' });
    }
    res.json(trailers[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo trailer
router.post('/', async (req, res) => {
  try {
    const { numero_economico, placas, marca, modelo, anio, kilometraje, estado } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO trailers (numero_economico, placas, marca, modelo, anio, kilometraje, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [numero_economico, placas, marca, modelo, anio, kilometraje, estado]
    );

    res.status(201).json({ id: result.insertId, message: 'Trailer creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar trailer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE trailers SET ${fields} WHERE id = ?`, values);
    res.json({ message: 'Trailer actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Historial de mantenimiento del trailer
router.get('/:id/mantenimiento', async (req, res) => {
  try {
    const [mantenimientos] = await db.query(
      'SELECT * FROM mantenimiento WHERE trailer_id = ? ORDER BY fecha DESC',
      [req.params.id]
    );
    res.json(mantenimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Historial de viajes del trailer
router.get('/:id/viajes', async (req, res) => {
  try {
    const [viajes] = await db.query(
      `SELECT v.*, cl.nombre as cliente_nombre 
       FROM viajes v 
       JOIN clientes cl ON v.cliente_id = cl.id
       WHERE v.trailer_id = ? 
       ORDER BY v.fecha_salida DESC`,
      [req.params.id]
    );
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
