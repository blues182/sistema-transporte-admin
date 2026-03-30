const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [usuarios] = await db.query(
      `SELECT id, username, nombre, rol, estado, created_at, updated_at
       FROM usuarios
       ORDER BY created_at DESC`
    );

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, nombre, password, rol } = req.body;

    if (!username || !nombre || !password) {
      return res.status(400).json({ error: 'Username, nombre y password son requeridos' });
    }

    const [existentes] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);
    if (existentes.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (username, password, nombre, rol, estado) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, nombre, rol || 'normal', 'activo']
    );

    res.status(201).json({ id: result.insertId, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nombre, rol, estado, password } = req.body;

    const [actuales] = await db.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (actuales.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (username) {
      const [duplicado] = await db.query('SELECT id FROM usuarios WHERE username = ? AND id <> ?', [username, id]);
      if (duplicado.length > 0) {
        return res.status(400).json({ error: 'El username ya esta en uso' });
      }
    }

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (rol !== undefined) {
      updates.push('rol = ?');
      values.push(rol);
    }
    if (estado !== undefined) {
      updates.push('estado = ?');
      values.push(estado);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);

    await db.query(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === Number(req.usuario.id)) {
      return res.status(400).json({ error: 'No puedes desactivar tu propio usuario' });
    }

    const [result] = await db.query('UPDATE usuarios SET estado = "inactivo" WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
});

module.exports = router;
