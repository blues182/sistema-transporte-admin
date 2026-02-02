const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los viajes
router.get('/', async (req, res) => {
  try {
    const { estado, fecha_inicio, fecha_fin } = req.query;
    let query = `
      SELECT v.*, 
             t.numero_economico, t.placas,
             CONCAT(c.nombre, ' ', c.apellidos) as conductor_nombre,
             cl.nombre as cliente_nombre
      FROM viajes v
      JOIN trailers t ON v.trailer_id = t.id
      JOIN conductores c ON v.conductor_id = c.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      query += ' AND v.estado = ?';
      params.push(estado);
    }
    if (fecha_inicio) {
      query += ' AND v.fecha_salida >= ?';
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      query += ' AND v.fecha_salida <= ?';
      params.push(fecha_fin);
    }

    query += ' ORDER BY v.fecha_salida DESC';

    const [viajes] = await db.query(query, params);
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un viaje por ID
router.get('/:id', async (req, res) => {
  try {
    const [viajes] = await db.query(`
      SELECT v.*, 
             t.numero_economico, t.placas,
             CONCAT(c.nombre, ' ', c.apellidos) as conductor_nombre,
             cl.nombre as cliente_nombre
      FROM viajes v
      JOIN trailers t ON v.trailer_id = t.id
      JOIN conductores c ON v.conductor_id = c.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE v.id = ?
    `, [req.params.id]);

    if (viajes.length === 0) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    // Obtener gastos del viaje
    const [gastos] = await db.query(
      'SELECT * FROM gastos_viaje WHERE viaje_id = ?',
      [req.params.id]
    );

    res.json({ ...viajes[0], gastos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo viaje
router.post('/', async (req, res) => {
  try {
    const {
      folio, fecha_salida, origen, destino, trailer_id, conductor_id,
      cliente_id, carga_descripcion, peso_carga, monto_cobrado, km_inicial
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO viajes (folio, fecha_salida, origen, destino, trailer_id, 
       conductor_id, cliente_id, carga_descripcion, peso_carga, monto_cobrado, km_inicial)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [folio, fecha_salida, origen, destino, trailer_id, conductor_id,
       cliente_id, carga_descripcion, peso_carga, monto_cobrado, km_inicial]
    );

    res.status(201).json({ id: result.insertId, message: 'Viaje creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar viaje
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE viajes SET ${fields} WHERE id = ?`,
      values
    );

    res.json({ message: 'Viaje actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Completar viaje
router.post('/:id/completar', async (req, res) => {
  try {
    const { fecha_llegada, km_final } = req.body;
    
    await db.query(
      `UPDATE viajes SET estado = 'completado', fecha_llegada = ?, km_final = ? WHERE id = ?`,
      [fecha_llegada, km_final, req.params.id]
    );

    res.json({ message: 'Viaje completado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calcular utilidad de un viaje
router.get('/:id/utilidad', async (req, res) => {
  try {
    const [viajes] = await db.query('SELECT monto_cobrado FROM viajes WHERE id = ?', [req.params.id]);
    if (viajes.length === 0) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    const [gastos] = await db.query(
      'SELECT SUM(monto) as total_gastos FROM gastos_viaje WHERE viaje_id = ?',
      [req.params.id]
    );

    const monto_cobrado = parseFloat(viajes[0].monto_cobrado);
    const total_gastos = parseFloat(gastos[0].total_gastos || 0);
    const utilidad = monto_cobrado - total_gastos;
    const margen = ((utilidad / monto_cobrado) * 100).toFixed(2);

    res.json({
      monto_cobrado,
      total_gastos,
      utilidad,
      margen_porcentaje: margen
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
