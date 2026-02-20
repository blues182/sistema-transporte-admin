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

// Obtener todos los trailers
router.get('/', async (req, res) => {
  try {
    const [trailers] = await db.query(
      `SELECT id, numero_economico, placas, marca, modelo, anio, kilometraje, estado,
              fecha_ultimo_servicio, notas, poliza_nombre, poliza_mime,
              (poliza_pdf IS NOT NULL) AS tiene_poliza,
              created_at, updated_at
       FROM trailers
       ORDER BY numero_economico`
    );
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trailer por ID
router.get('/:id', async (req, res) => {
  try {
    const [trailers] = await db.query(
      `SELECT id, numero_economico, placas, marca, modelo, anio, kilometraje, estado,
              fecha_ultimo_servicio, notas, poliza_nombre, poliza_mime,
              (poliza_pdf IS NOT NULL) AS tiene_poliza,
              created_at, updated_at
       FROM trailers
       WHERE id = ?`,
      [req.params.id]
    );
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

    if (!numero_economico || !placas) {
      return res.status(400).json({ error: 'Número económico y placas son obligatorios' });
    }

    if (kilometraje !== undefined && kilometraje !== null && kilometraje !== '') {
      const km = Number(kilometraje);
      if (Number.isNaN(km) || km < 0 || km > 99999999.99) {
        return res.status(400).json({ error: 'Kilometraje inválido. Debe estar entre 0 y 99,999,999.99' });
      }
    }
    
    const [result] = await db.query(
      `INSERT INTO trailers (numero_economico, placas, marca, modelo, anio, kilometraje, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [numero_economico, placas, marca, modelo, anio, kilometraje, estado]
    );

    res.status(201).json({ id: result.insertId, message: 'Trailer creado exitosamente' });
  } catch (error) {
    console.error('Error al crear trailer:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un trailer con ese número económico o placas' });
    }
    if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
      return res.status(400).json({ error: 'Algún valor numérico está fuera de rango permitido' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Actualizar trailer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (Object.prototype.hasOwnProperty.call(updates, 'kilometraje')) {
      const km = Number(updates.kilometraje);
      if (Number.isNaN(km) || km < 0 || km > 99999999.99) {
        return res.status(400).json({ error: 'Kilometraje inválido. Debe estar entre 0 y 99,999,999.99' });
      }
    }
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(`UPDATE trailers SET ${fields} WHERE id = ?`, values);
    res.json({ message: 'Trailer actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar trailer:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un trailer con ese número económico o placas' });
    }
    if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
      return res.status(400).json({ error: 'Algún valor numérico está fuera de rango permitido' });
    }
    res.status(500).json({ error: error.message });
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
      `UPDATE trailers
       SET poliza_pdf = ?, poliza_nombre = ?, poliza_mime = ?, poliza_updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.file.buffer, req.file.originalname, 'application/pdf', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trailer no encontrado' });
    }

    res.json({ message: 'Póliza PDF subida exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/poliza', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT poliza_pdf, poliza_nombre, poliza_mime FROM trailers WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trailer no encontrado' });
    }

    const trailer = rows[0];
    if (!trailer.poliza_pdf) {
      return res.status(404).json({ error: 'Este trailer no tiene póliza cargada' });
    }

    const nombreArchivo = trailer.poliza_nombre || `poliza-trailer-${id}.pdf`;
    res.setHeader('Content-Type', trailer.poliza_mime || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(nombreArchivo)}`);
    return res.send(trailer.poliza_pdf);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/poliza', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      `UPDATE trailers
       SET poliza_pdf = NULL, poliza_nombre = NULL, poliza_mime = NULL, poliza_updated_at = NULL
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trailer no encontrado' });
    }

    res.json({ message: 'Póliza eliminada exitosamente' });
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
