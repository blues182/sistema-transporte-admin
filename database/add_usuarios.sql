-- Agregar tabla de usuarios y datos de prueba
USE transportes_db;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'normal') DEFAULT 'normal',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);

-- Insertar usuarios de prueba (contraseñas hasheadas con bcrypt)
-- admin123 y user123
INSERT IGNORE INTO usuarios (username, password, nombre, rol, estado) VALUES
('admin', '$2a$10$8K1p/a0dL3.GyXVDkqVQmO1LQxJqY9rH1tEIvJFvC8l4qPqJQZmli', 'Administrador', 'admin', 'activo'),
('usuario', '$2a$10$8K1p/a0dL3.GyXVDkqVQmO1LQxJqY9rH1tEIvJFvC8l4qPqJQZmli', 'Usuario Normal', 'normal', 'activo');
