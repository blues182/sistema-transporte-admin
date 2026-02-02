const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET todos los remolques
router.get('/', async (req, res) => {
  try {
    const [remolques] = await db.query('SELECT * FROM remolques ORDER BY numero_remolque');
    res.json(remolques);
  } catch (error) {
    console.error('Error al obtener remolques:', error);
    res.status(500).json({ error: 'Error al obtener remolques' });
  }
});

// GET remolque por ID
router.get('/:id', async (req, res) => {
  try {
    const [remolques] = await db.query('SELECT * FROM remolques WHERE id = ?', [req.params.id]);
    if (remolques.length === 0) {
      return res.status(404).json({ error: 'Remolque no encontrado' });
    }
    res.json(remolques[0]);
  } catch (error) {
    console.error('Error al obtener remolque:', error);
    res.status(500).json({ error: 'Error al obtener remolque' });
  }
});

// POST crear remolque
router.post('/', async (req, res) => {
  try {
    const { numero_remolque, tipo, capacidad_toneladas, estado } = req.body;
    
    // Validación
    if (!numero_remolque || !capacidad_toneladas) {
      return res.status(400).json({ error: 'Número de remolque y capacidad son requeridos' });
    }
    
    const [result] = await db.query(
      'INSERT INTO remolques (numero_remolque, tipo, capacidad_toneladas, estado) VALUES (?, ?, ?, ?)',
      [numero_remolque, tipo || 'caja_seca', capacidad_toneladas, estado || 'disponible']
    );
    
    res.status(201).json({ id: result.insertId, message: 'Remolque creado exitosamente' });
  } catch (error) {
    console.error('Error al crear remolque:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un remolque con ese número' });
    }
    res.status(500).json({ error: error.message || 'Error al crear remolque' });
  }
});

// PUT actualizar remolque
router.put('/:id', async (req, res) => {
  try {
    const { numero_remolque, tipo, capacidad_toneladas, estado } = req.body;
    
    await db.query(
      'UPDATE remolques SET numero_remolque = ?, tipo = ?, capacidad_toneladas = ?, estado = ? WHERE id = ?',
      [numero_remolque, tipo, capacidad_toneladas, estado, req.params.id]
    );
    
    res.json({ message: 'Remolque actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar remolque:', error);
    res.status(500).json({ error: 'Error al actualizar remolque' });
  }
});

// DELETE remolque
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM remolques WHERE id = ?', [req.params.id]);
    res.json({ message: 'Remolque eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar remolque:', error);
    res.status(500).json({ error: 'Error al eliminar remolque' });
  }
});

module.exports = router;
