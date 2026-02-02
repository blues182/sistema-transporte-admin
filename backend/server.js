const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importar rutas
const authRoutes = require('./routes/auth');
const viajesRoutes = require('./routes/viajes');
const trailersRoutes = require('./routes/trailers');
const remolquesRoutes = require('./routes/remolques');
const conductoresRoutes = require('./routes/conductores');
const clientesRoutes = require('./routes/clientes');
const refaccionesRoutes = require('./routes/refacciones');
const gastosRoutes = require('./routes/gastos');
const mantenimientoRoutes = require('./routes/mantenimiento');
const reportesRoutes = require('./routes/reportes');

// Middleware de autenticación
const { verificarToken, verificarPermisoEscritura } = require('./middleware/auth');

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/viajes', verificarToken, verificarPermisoEscritura, viajesRoutes);
app.use('/api/trailers', verificarToken, verificarPermisoEscritura, trailersRoutes);
app.use('/api/remolques', verificarToken, verificarPermisoEscritura, remolquesRoutes);
app.use('/api/conductores', verificarToken, verificarPermisoEscritura, conductoresRoutes);
app.use('/api/clientes', verificarToken, verificarPermisoEscritura, clientesRoutes);
app.use('/api/refacciones', verificarToken, verificarPermisoEscritura, refaccionesRoutes);
app.use('/api/gastos', verificarToken, verificarPermisoEscritura, gastosRoutes);
app.use('/api/mantenimiento', verificarToken, verificarPermisoEscritura, mantenimientoRoutes);
app.use('/api/reportes', verificarToken, reportesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Sistema de Transporte funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚛 Servidor corriendo en puerto ${PORT}`);
});
