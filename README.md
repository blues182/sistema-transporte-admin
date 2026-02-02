# 🚛 Sistema de Administración de Transporte

Sistema completo para administrar empresas de transporte de carga pesada con trailers.

## 📋 Características Principales

### ✅ Módulos Implementados

1. **Dashboard**
   - Resumen de viajes activos
   - Ingresos y gastos del mes
   - Alertas de trailers en mantenimiento
   - Refacciones con stock bajo
   - Accesos rápidos

2. **Gestión de Viajes**
   - Registro de viajes por semana
   - Asignación de trailer y conductor
   - Control de origen/destino
   - Cálculo automático de utilidad
   - Registro de gastos por viaje (diesel, casetas, viáticos, etc.)
   - Estados: Programado, En Ruta, Completado, Cancelado

3. **Trailers**
   - Registro de unidades
   - Control de kilometraje
   - Estados: Activo, Mantenimiento, Inactivo
   - Historial de viajes y mantenimiento

4. **Conductores**
   - Base de datos de conductores
   - Control de licencias y vencimientos
   - Historial de viajes
   - Registro de pagos

5. **Clientes**
   - Gestión de clientes
   - Días de crédito
   - Historial de viajes

6. **Inventario de Refacciones** 📦
   - Control de stock
   - Alertas de stock bajo
   - Registro de entradas/salidas
   - Ubicación en almacén
   - Categorías

7. **Mantenimiento** 🔧
   - Preventivo, Correctivo, Emergencia
   - Registro de refacciones usadas
   - Costo de mano de obra
   - Actualización automática de inventario

8. **Reportes** 📊
   - Reportes semanales y mensuales
   - Utilidad por viaje
   - Gastos por tipo
   - Clientes más activos
   - Trailers más rentables

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**
- **MariaDB** (MySQL compatible)
- **Arquitectura RESTful API**

### Frontend
- **React 18**
- **Tailwind CSS** (diseño responsive)
- **React Router** (navegación)
- **Recharts** (gráficas)
- **Axios** (HTTP client)

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- MariaDB o MySQL (v10.5 o superior)
- npm o yarn

### Paso 1: Instalar dependencias

```powershell
# Instalar dependencias de todo el proyecto
npm run install-all
```

O manualmente:

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Paso 2: Configurar Base de Datos

1. Crear la base de datos:
```powershell
# Conectar a MariaDB
mysql -u root -p

# Ejecutar el script de creación
source database/schema.sql

# (Opcional) Cargar datos de ejemplo
source database/seed.sql
```

2. Configurar variables de entorno:
```powershell
# En la carpeta backend, copiar el archivo de ejemplo
cd backend
copy .env.example .env

# Editar .env con tus credenciales
```

Archivo `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=transportes_db
DB_PORT=3306
JWT_SECRET=tu_clave_secreta_super_segura_123
```

### Paso 3: Ejecutar la Aplicación

#### Opción 1: Ejecutar todo junto (recomendado)
```powershell
npm run dev
```

#### Opción 2: Ejecutar por separado

Terminal 1 - Backend:
```powershell
cd backend
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm start
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Estructura del Proyecto

```
Admistracionapp/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de MariaDB
│   ├── routes/
│   │   ├── viajes.js            # Rutas de viajes
│   │   ├── trailers.js          # Rutas de trailers
│   │   ├── conductores.js       # Rutas de conductores
│   │   ├── clientes.js          # Rutas de clientes
│   │   ├── refacciones.js       # Rutas de inventario
│   │   ├── gastos.js            # Rutas de gastos
│   │   ├── mantenimiento.js     # Rutas de mantenimiento
│   │   └── reportes.js          # Rutas de reportes
│   ├── server.js                # Servidor Express
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js        # Layout principal
│   │   ├── pages/
│   │   │   ├── Dashboard.js     # Página principal
│   │   │   ├── Viajes.js        # Lista de viajes
│   │   │   ├── ViajeDetalle.js  # Detalle de viaje
│   │   │   ├── NuevoViaje.js    # Formulario nuevo viaje
│   │   │   ├── Trailers.js      # Gestión de trailers
│   │   │   ├── Conductores.js   # Gestión de conductores
│   │   │   ├── Clientes.js      # Gestión de clientes
│   │   │   ├── Refacciones.js   # Inventario
│   │   │   ├── Mantenimiento.js # Mantenimientos
│   │   │   └── Reportes.js      # Reportes
│   │   ├── services/
│   │   │   └── api.js           # Cliente HTTP
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   ├── schema.sql               # Estructura de la BD
│   └── seed.sql                 # Datos de ejemplo
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Viajes
- `GET /api/viajes` - Listar viajes
- `GET /api/viajes/:id` - Detalle de viaje
- `POST /api/viajes` - Crear viaje
- `PUT /api/viajes/:id` - Actualizar viaje
- `GET /api/viajes/:id/utilidad` - Calcular utilidad

### Trailers
- `GET /api/trailers` - Listar trailers
- `POST /api/trailers` - Crear trailer
- `GET /api/trailers/:id/mantenimiento` - Historial mantenimiento

### Refacciones
- `GET /api/refacciones` - Listar refacciones
- `GET /api/refacciones/stock-bajo` - Refacciones con stock bajo
- `POST /api/refacciones/:id/entrada` - Registrar entrada
- `POST /api/refacciones/:id/salida` - Registrar salida

### Reportes
- `GET /api/reportes/dashboard` - Dashboard resumen
- `GET /api/reportes/semanal` - Reporte semanal
- `GET /api/reportes/mensual` - Reporte mensual
- `GET /api/reportes/utilidad-viajes` - Utilidad por viaje

## 🎨 Características del Diseño

- ✅ **Responsive** - Funciona en desktop, tablet y móvil
- ✅ **Moderna** - Diseño limpio con Tailwind CSS
- ✅ **Intuitiva** - Navegación fácil con sidebar
- ✅ **Visual** - Tarjetas, badges de estado, colores por categoría
- ✅ **Profesional** - Lista para producción

## 📊 Base de Datos

### Tablas Principales
- `trailers` - Unidades de transporte
- `conductores` - Choferes
- `clientes` - Empresas cliente
- `viajes` - Registro de viajes
- `gastos_viaje` - Gastos por viaje
- `refacciones` - Inventario de refacciones
- `mantenimiento` - Mantenimientos
- `mantenimiento_refacciones` - Refacciones usadas
- `movimientos_inventario` - Historial de inventario
- `pagos_conductores` - Pagos a conductores

## 🚀 Próximos Pasos

1. Completar módulos de Conductores y Clientes (interfaz completa)
2. Implementar módulo de Mantenimiento (interfaz completa)
3. Agregar autenticación de usuarios
4. Exportar reportes a PDF/Excel
5. Notificaciones por email
6. Dashboard con gráficas avanzadas

## 📝 Notas Importantes

- Los datos de ejemplo están en `database/seed.sql`
- La aplicación viene con 3 trailers, 3 conductores, 3 clientes y viajes de ejemplo
- El inventario incluye refacciones comunes (filtros, balatas, aceite, llantas)
- Los folios de viaje se generan automáticamente

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MariaDB esté corriendo
- Revisa las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `transportes_db` exista

### Puerto 5000 o 3000 ya en uso
- Cambia el puerto en el archivo `.env` (backend)
- Para React, crear archivo `.env` en frontend con `PORT=3001`

## 👨‍💻 Autor

Sistema desarrollado para administración de transporte de carga pesada.

## 📄 Licencia

ISC
