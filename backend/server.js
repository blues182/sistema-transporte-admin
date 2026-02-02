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
const viajesRoutes = require('./routes/viajes');
const trailersRoutes = require('./routes/trailers');
const remolquesRoutes = require('./routes/remolques');
const conductoresRoutes = require('./routes/conductores');
const clientesRoutes = require('./routes/clientes');
const refaccionesRoutes = require('./routes/refacciones');
const gastosRoutes = require('./routes/gastos');
const mantenimientoRoutes = require('./routes/mantenimiento');
const reportesRoutes = require('./routes/reportes');

// Usar rutas
app.use('/api/viajes', viajesRoutes);
app.use('/api/trailers', trailersRoutes);
app.use('/api/remolques', remolquesRoutes);
app.use('/api/conductores', conductoresRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/refacciones', refaccionesRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/mantenimiento', mantenimientoRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Sistema de Transporte funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚛 Servidor corriendo en puerto ${PORT}`);
});
