const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_en_produccion';

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }
  next();
};

// Middleware para verificar permisos de escritura
const verificarPermisoEscritura = (req, res, next) => {
  // Admin tiene todos los permisos
  if (req.usuario.rol === 'admin') {
    return next();
  }

  // Usuario normal solo puede crear viajes y gastos
  const rutasPermitidas = ['/api/viajes', '/api/gastos'];
  const esRutaPermitida = rutasPermitidas.some(ruta => req.originalUrl.startsWith(ruta));
  
  if (req.method === 'POST' && esRutaPermitida) {
    return next();
  }

  // Para PUT y DELETE, solo admin
  if (['PUT', 'DELETE'].includes(req.method)) {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarPermisoEscritura
};
