-- Base de datos para Sistema de Administración de Transporte
CREATE DATABASE IF NOT EXISTS transportes_db;
USE transportes_db;

-- Tabla de Trailers
CREATE TABLE trailers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_economico VARCHAR(50) UNIQUE NOT NULL,
    placas VARCHAR(50) UNIQUE NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    anio INT,
    kilometraje DECIMAL(10, 2) DEFAULT 0,
    estado ENUM('activo', 'mantenimiento', 'inactivo') DEFAULT 'activo',
    fecha_ultimo_servicio DATE,
    notas TEXT,
    poliza_nombre VARCHAR(255),
    poliza_mime VARCHAR(100),
    poliza_pdf LONGBLOB,
    poliza_updated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Remolques
CREATE TABLE remolques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_remolque VARCHAR(50) UNIQUE NOT NULL,
    tipo ENUM('caja_seca', 'plataforma', 'tolva', 'tanque', 'refrigerado') DEFAULT 'caja_seca',
    capacidad_toneladas DECIMAL(10, 2) NOT NULL,
    estado ENUM('disponible', 'en_uso', 'mantenimiento', 'fuera_servicio') DEFAULT 'disponible',
    poliza_nombre VARCHAR(255),
    poliza_mime VARCHAR(100),
    poliza_pdf LONGBLOB,
    poliza_updated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Conductores
CREATE TABLE conductores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    licencia VARCHAR(50) UNIQUE,
    vencimiento_licencia DATE,
    licencia_federal ENUM('si', 'no') DEFAULT 'no',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    requiere_factura ENUM('si', 'no') DEFAULT 'no',
    rfc VARCHAR(13),
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto VARCHAR(100),
    credito_dias INT DEFAULT 0,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Viajes
CREATE TABLE viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    numero_orden VARCHAR(100),
    fecha_salida DATETIME NOT NULL,
    fecha_llegada DATETIME,
    origen VARCHAR(200) NOT NULL,
    destino VARCHAR(200) NOT NULL,
    trailer_id INT NOT NULL,
    numero_remolque VARCHAR(50),
    conductor_id INT NOT NULL,
    cliente_id INT NOT NULL,
    carga_descripcion TEXT,
    tipo_carga ENUM('general', 'cemento', 'otro') DEFAULT 'general',
    peso_carga DECIMAL(10, 2),
    monto_cobrado DECIMAL(10, 2) NOT NULL,
    estado ENUM('programado', 'en_ruta', 'completado', 'cancelado') DEFAULT 'programado',
    km_inicial DECIMAL(10, 2),
    km_final DECIMAL(10, 2),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trailer_id) REFERENCES trailers(id),
    FOREIGN KEY (conductor_id) REFERENCES conductores(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabla de Gastos de Viaje
CREATE TABLE gastos_viaje (
    id INT AUTO_INCREMENT PRIMARY KEY,
    viaje_id INT NOT NULL,
    concepto VARCHAR(200),
    tipo_gasto ENUM('diesel', 'casetas', 'combustible', 'peaje', 'operacion', 'viaticos', 'reparacion', 'estacionamiento', 'otro') NOT NULL,
    litros_diesel DECIMAL(10, 2) NULL,
    precio_litro DECIMAL(10, 2) NULL,
    numero_caseta VARCHAR(100) NULL,
    nombre_caseta VARCHAR(200) NULL,
    descripcion VARCHAR(200),
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NULL DEFAULT (CURRENT_DATE),
    comprobante VARCHAR(200),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE
);

-- Tabla de Refacciones (Inventario)
CREATE TABLE refacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    precio_unitario DECIMAL(10, 2) DEFAULT 0,
    ubicacion VARCHAR(100),
    estado ENUM('disponible', 'agotado', 'descontinuado') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Mantenimiento
CREATE TABLE mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trailer_id INT NOT NULL,
    fecha DATE NOT NULL,
    tipo ENUM('preventivo', 'correctivo', 'emergencia') NOT NULL,
    descripcion TEXT NOT NULL,
    kilometraje DECIMAL(10, 2),
    costo_mano_obra DECIMAL(10, 2) DEFAULT 0,
    estado ENUM('programado', 'en_proceso', 'completado') DEFAULT 'programado',
    taller VARCHAR(200),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trailer_id) REFERENCES trailers(id)
);

-- Tabla de Refacciones usadas en Mantenimiento
CREATE TABLE mantenimiento_refacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mantenimiento_id INT NOT NULL,
    refaccion_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mantenimiento_id) REFERENCES mantenimiento(id) ON DELETE CASCADE,
    FOREIGN KEY (refaccion_id) REFERENCES refacciones(id)
);

-- Tabla de Movimientos de Inventario
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refaccion_id INT NOT NULL,
    tipo ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    fecha DATE NOT NULL,
    motivo VARCHAR(200),
    referencia VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (refaccion_id) REFERENCES refacciones(id)
);

-- Tabla de Pagos a Conductores
CREATE TABLE pagos_conductores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conductor_id INT NOT NULL,
    viaje_id INT,
    tipo ENUM('anticipo', 'sueldo', 'comision', 'bono') NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    descripcion VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conductor_id) REFERENCES conductores(id),
    FOREIGN KEY (viaje_id) REFERENCES viajes(id)
);

-- Tabla de Usuarios
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

-- Índices para mejorar rendimiento
CREATE INDEX idx_viajes_fecha ON viajes(fecha_salida);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_gastos_viaje ON gastos_viaje(viaje_id);
CREATE INDEX idx_mantenimiento_trailer ON mantenimiento(trailer_id);
CREATE INDEX idx_refacciones_stock ON refacciones(stock_actual);
CREATE INDEX idx_usuarios_username ON usuarios(username);
