const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener gastos de un viaje
router.get('/viaje/:viajeId', async (req, res) => {
  try {
    const [gastos] = await db.query(
      'SELECT * FROM gastos_viaje WHERE viaje_id = ? ORDER BY fecha',
      [req.params.viajeId]
    );
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo gasto
router.post('/', async (req, res) => {
  try {
    const { viaje_id, tipo_gasto, descripcion, monto, fecha, comprobante } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO gastos_viaje (viaje_id, tipo_gasto, descripcion, monto, fecha, comprobante)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [viaje_id, tipo_gasto, descripcion, monto, fecha, comprobante]
    );

    res.status(201).json({ id: result.insertId, message: 'Gasto registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar gasto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE gastos_viaje SET ${fields} WHERE id = ?`, values);
    res.json({ message: 'Gasto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar gasto
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM gastos_viaje WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resumen de gastos por tipo
router.get('/resumen/:viajeId', async (req, res) => {
  try {
    const [resumen] = await db.query(
      `SELECT tipo_gasto, SUM(monto) as total
       FROM gastos_viaje
       WHERE viaje_id = ?
       GROUP BY tipo_gasto`,
      [req.params.viajeId]
    );
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
