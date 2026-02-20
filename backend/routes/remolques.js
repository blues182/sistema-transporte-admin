const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// GET todos los remolques
router.get('/', async (req, res) => {
  try {
    const [remolques] = await db.query(
      `SELECT id, numero_remolque, tipo, capacidad_toneladas, estado,
              poliza_nombre, poliza_mime,
              (poliza_pdf IS NOT NULL) AS tiene_poliza,
              created_at, updated_at
       FROM remolques
       ORDER BY numero_remolque`
    );
    res.json(remolques);
  } catch (error) {
    console.error('Error al obtener remolques:', error);
    res.status(500).json({ error: 'Error al obtener remolques' });
  }
});

// GET remolque por ID
router.get('/:id', async (req, res) => {
  try {
    const [remolques] = await db.query(
      `SELECT id, numero_remolque, tipo, capacidad_toneladas, estado,
              poliza_nombre, poliza_mime,
              (poliza_pdf IS NOT NULL) AS tiene_poliza,
              created_at, updated_at
       FROM remolques
       WHERE id = ?`,
      [req.params.id]
    );
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

router.post('/:id/poliza', upload.single('poliza'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo PDF' });
    }

    const esPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
    if (!esPdf) {
      return res.status(400).json({ error: 'Solo se permiten archivos PDF' });
    }

    const [result] = await db.query(
      `UPDATE remolques
       SET poliza_pdf = ?, poliza_nombre = ?, poliza_mime = ?, poliza_updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.file.buffer, req.file.originalname, 'application/pdf', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Remolque no encontrado' });
    }

    res.json({ message: 'Póliza PDF subida exitosamente' });
  } catch (error) {
    console.error('Error al subir póliza de remolque:', error);
    res.status(500).json({ error: error.message || 'Error al subir póliza de remolque' });
  }
});

router.get('/:id/poliza', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT poliza_pdf, poliza_nombre, poliza_mime FROM remolques WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Remolque no encontrado' });
    }

    const remolque = rows[0];
    if (!remolque.poliza_pdf) {
      return res.status(404).json({ error: 'Este remolque no tiene póliza cargada' });
    }

    const nombreArchivo = remolque.poliza_nombre || `poliza-remolque-${id}.pdf`;
    res.setHeader('Content-Type', remolque.poliza_mime || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(nombreArchivo)}`);
    return res.send(remolque.poliza_pdf);
  } catch (error) {
    console.error('Error al descargar póliza de remolque:', error);
    res.status(500).json({ error: error.message || 'Error al descargar póliza de remolque' });
  }
});

router.delete('/:id/poliza', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      `UPDATE remolques
       SET poliza_pdf = NULL, poliza_nombre = NULL, poliza_mime = NULL, poliza_updated_at = NULL
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Remolque no encontrado' });
    }

    res.json({ message: 'Póliza eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar póliza de remolque:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar póliza de remolque' });
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
