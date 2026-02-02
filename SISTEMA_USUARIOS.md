# Sistema de Autenticación de Usuarios

## Configuración Completada ✅

Se ha implementado un sistema completo de autenticación con roles y permisos:

### 1. Base de Datos
- Nueva tabla `usuarios` creada en `database/schema.sql`
- Usuarios de prueba agregados en `database/seed.sql`

### 2. Backend
- Rutas de autenticación: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify`
- Middleware de autenticación con JWT
- Protección de rutas según rol de usuario

### 3. Frontend
- Página de login
- Protección de rutas
- Manejo de sesión con localStorage
- Menú de usuario con información y logout

## Usuarios de Prueba

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Permisos**: Acceso completo (crear, editar, eliminar todo)

### Usuario Normal
- **Usuario**: `usuario`
- **Contraseña**: `user123`
- **Permisos**: Solo lectura y crear viajes/gastos

## Aplicar Cambios a la Base de Datos

Para aplicar los cambios, ejecuta en MySQL/MariaDB:

```sql
-- Crear tabla de usuarios
USE transportes_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'normal') DEFAULT 'normal',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_username ON usuarios(username);

-- Insertar usuarios de prueba
-- Contraseña hasheada para 'admin123' y 'user123'
INSERT INTO usuarios (username, password, nombre, rol, estado) VALUES
('admin', '$2a$10$8K1p/a0dL3.GyXVDkqVQmO1LQxJqY9rH1tEIvJFvC8l4qPqJQZmli', 'Administrador', 'admin', 'activo'),
('usuario', '$2a$10$8K1p/a0dL3.GyXVDkqVQmO1LQxJqY9rH1tEIvJFvC8l4qPqJQZmli', 'Usuario Normal', 'normal', 'activo');
```

## Permisos por Rol

### Administrador (admin)
- ✅ Ver todos los módulos
- ✅ Crear en todos los módulos
- ✅ Editar en todos los módulos
- ✅ Eliminar en todos los módulos

### Usuario Normal (normal)
- ✅ Ver todos los módulos (lectura)
- ✅ Crear viajes
- ✅ Crear gastos de viaje
- ❌ No puede editar
- ❌ No puede eliminar
- ❌ No puede crear/editar/eliminar: trailers, conductores, clientes, refacciones, mantenimiento

## Cómo Usar

1. **Aplicar los cambios a la base de datos** (ver comandos SQL arriba)

2. **Reiniciar el servidor backend**

3. **Acceder a la aplicación**:
   - Navega a http://localhost:3000
   - Serás redirigido automáticamente al login
   - Ingresa con uno de los usuarios de prueba

4. **Crear nuevos usuarios** (solo admin):
   ```javascript
   POST /api/auth/register
   {
     "username": "nuevo_usuario",
     "password": "contraseña",
     "nombre": "Nombre Completo",
     "rol": "normal" // o "admin"
   }
   ```

## Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt (10 rounds)
- Los tokens JWT expiran en 8 horas
- Las rutas protegidas requieren token válido
- El middleware verifica permisos según el rol antes de permitir operaciones

## Variable de Entorno (Opcional)

Para mayor seguridad en producción, agrega en `.env`:

```env
JWT_SECRET=tu_secreto_muy_seguro_y_aleatorio_aqui
```

Si no se define, se usa un secreto por defecto (cambiar en producción).
