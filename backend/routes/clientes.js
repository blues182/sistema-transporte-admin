const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes ORDER BY nombre');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(clientes[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, rfc, direccion, telefono, email, contacto, credito_dias } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO clientes (nombre, rfc, direccion, telefono, email, contacto, credito_dias)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, rfc, direccion, telefono, email, contacto, credito_dias]
    );

    res.status(201).json({ id: result.insertId, message: 'Cliente creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE clientes SET ${fields} WHERE id = ?`, values);
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Viajes del cliente
router.get('/:id/viajes', async (req, res) => {
  try {
    const [viajes] = await db.query(
      `SELECT v.*, t.numero_economico, CONCAT(c.nombre, ' ', c.apellidos) as conductor_nombre
       FROM viajes v
       JOIN trailers t ON v.trailer_id = t.id
       JOIN conductores c ON v.conductor_id = c.id
       WHERE v.cliente_id = ?
       ORDER BY v.fecha_salida DESC`,
      [req.params.id]
    );
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
