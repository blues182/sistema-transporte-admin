const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las refacciones
router.get('/', async (req, res) => {
  try {
    const [refacciones] = await db.query('SELECT * FROM refacciones ORDER BY nombre');
    res.json(refacciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener refacciones con stock bajo
router.get('/stock-bajo', async (req, res) => {
  try {
    const [refacciones] = await db.query(
      'SELECT * FROM refacciones WHERE stock_actual <= stock_minimo ORDER BY stock_actual'
    );
    res.json(refacciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener refacción por ID
router.get('/:id', async (req, res) => {
  try {
    const [refacciones] = await db.query('SELECT * FROM refacciones WHERE id = ?', [req.params.id]);
    if (refacciones.length === 0) {
      return res.status(404).json({ error: 'Refacción no encontrada' });
    }
    res.json(refacciones[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva refacción
router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, ubicacion } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO refacciones (codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, ubicacion]
    );

    res.status(201).json({ id: result.insertId, message: 'Refacción creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar refacción
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE refacciones SET ${fields} WHERE id = ?`, values);
    res.json({ message: 'Refacción actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar entrada de inventario
router.post('/:id/entrada', async (req, res) => {
  try {
    const { cantidad, motivo, referencia } = req.body;
    const fecha = new Date().toISOString().split('T')[0];

    await db.query('START TRANSACTION');

    await db.query(
      'UPDATE refacciones SET stock_actual = stock_actual + ? WHERE id = ?',
      [cantidad, req.params.id]
    );

    await db.query(
      `INSERT INTO movimientos_inventario (refaccion_id, tipo, cantidad, fecha, motivo, referencia)
       VALUES (?, 'entrada', ?, ?, ?, ?)`,
      [req.params.id, cantidad, fecha, motivo, referencia]
    );

    await db.query('COMMIT');
    res.json({ message: 'Entrada registrada exitosamente' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Registrar salida de inventario
router.post('/:id/salida', async (req, res) => {
  try {
    const { cantidad, motivo, referencia } = req.body;
    const fecha = new Date().toISOString().split('T')[0];

    await db.query('START TRANSACTION');

    const [refaccion] = await db.query('SELECT stock_actual FROM refacciones WHERE id = ?', [req.params.id]);
    if (refaccion[0].stock_actual < cantidad) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    await db.query(
      'UPDATE refacciones SET stock_actual = stock_actual - ? WHERE id = ?',
      [cantidad, req.params.id]
    );

    await db.query(
      `INSERT INTO movimientos_inventario (refaccion_id, tipo, cantidad, fecha, motivo, referencia)
       VALUES (?, 'salida', ?, ?, ?, ?)`,
      [req.params.id, cantidad, fecha, motivo, referencia]
    );

    await db.query('COMMIT');
    res.json({ message: 'Salida registrada exitosamente' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Historial de movimientos
router.get('/:id/movimientos', async (req, res) => {
  try {
    const [movimientos] = await db.query(
      'SELECT * FROM movimientos_inventario WHERE refaccion_id = ? ORDER BY fecha DESC',
      [req.params.id]
    );
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
