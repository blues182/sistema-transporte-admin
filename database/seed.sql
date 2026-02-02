-- Datos de ejemplo para pruebas
USE transportes_db;

-- Usuarios de ejemplo (password: admin123 y user123)
-- Las contraseñas están hasheadas con bcrypt
INSERT INTO usuarios (username, password, nombre, rol, estado) VALUES
('admin', '$2a$10$8K1p/a0dL3.GyXVDkqVQmO1LQxJqY9rH1tEIvJFvC8l4qPqJQZmli', 'Administrador', 'admin', 'activo'),
('usuario', '$2a$10$8K1p/a0dL3.GyXVDkqVQmO1LQxJqY9rH1tEIvJFvC8l4qPqJQZmli', 'Usuario Normal', 'normal', 'activo');

-- Trailers de ejemplo
INSERT INTO trailers (numero_economico, placas, marca, modelo, anio, kilometraje, estado) VALUES
('T-001', 'ABC-123-D', 'Freightliner', 'Cascadia', 2020, 145000.00, 'activo'),
('T-002', 'DEF-456-G', 'Kenworth', 'T680', 2019, 198500.00, 'activo'),
('T-003', 'GHI-789-J', 'International', 'LT', 2021, 87300.00, 'mantenimiento');

-- Conductores de ejemplo
INSERT INTO conductores (nombre, apellidos, telefono, licencia, vencimiento_licencia, estado) VALUES
('Juan', 'Pérez García', '555-1234', 'LIC123456', '2026-12-31', 'activo'),
('María', 'López Sánchez', '555-5678', 'LIC789012', '2027-06-30', 'activo'),
('Carlos', 'Martínez Ruiz', '555-9012', 'LIC345678', '2026-08-15', 'activo');

-- Clientes de ejemplo
INSERT INTO clientes (nombre, rfc, direccion, telefono, email, contacto, credito_dias, estado) VALUES
('Construcciones del Norte SA', 'CDN990101ABC', 'Av. Industrial 123, Monterrey', '555-1111', 'compras@cdnorte.com', 'Ing. Roberto Torres', 30, 'activo'),
('Distribuidora del Bajío', 'DBA850215XYZ', 'Carr. Panamericana km 45, León', '555-2222', 'logistica@disbajio.com', 'Lic. Ana Flores', 15, 'activo'),
('Grupo Industrial Pacífico', 'GIP920630QWE', 'Zona Industrial Sur, Guadalajara', '555-3333', 'contacto@gipac.com', 'Ing. Luis Ramírez', 45, 'activo');

-- Refacciones de ejemplo
INSERT INTO refacciones (codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, ubicacion) VALUES
('FIL-001', 'Filtro de Aceite', 'Filtro de aceite para motor diesel', 'Filtros', 25, 10, 450.00, 'Estante A1'),
('FIL-002', 'Filtro de Aire', 'Filtro de aire industrial', 'Filtros', 18, 8, 850.00, 'Estante A2'),
('FRE-001', 'Balatas Delanteras', 'Juego de balatas delanteras', 'Frenos', 12, 5, 2500.00, 'Estante B1'),
('FRE-002', 'Balatas Traseras', 'Juego de balatas traseras', 'Frenos', 10, 5, 2800.00, 'Estante B2'),
('ACE-001', 'Aceite Motor 15W40', 'Aceite sintético para motor diesel', 'Lubricantes', 40, 15, 350.00, 'Almacén Principal'),
('LLA-001', 'Llantas 295/80R22.5', 'Llanta para trailer uso pesado', 'Llantas', 8, 4, 8500.00, 'Bodega Llantas');

-- Viajes de ejemplo
INSERT INTO viajes (folio, fecha_salida, fecha_llegada, origen, destino, trailer_id, conductor_id, cliente_id, carga_descripcion, peso_carga, monto_cobrado, estado, km_inicial, km_final) VALUES
('V-2026-001', '2026-01-15 08:00:00', '2026-01-16 14:30:00', 'CDMX', 'Monterrey', 1, 1, 1, 'Material de construcción', 22000.00, 35000.00, 'completado', 145000.00, 145950.00),
('V-2026-002', '2026-01-20 06:00:00', '2026-01-21 10:00:00', 'Guadalajara', 'León', 2, 2, 2, 'Productos alimenticios', 18500.00, 28000.00, 'completado', 198500.00, 198850.00),
('V-2026-003', '2026-01-25 07:30:00', NULL, 'CDMX', 'Guadalajara', 1, 3, 3, 'Maquinaria industrial', 25000.00, 42000.00, 'en_ruta', 145950.00, NULL);

-- Gastos de viaje
INSERT INTO gastos_viaje (viaje_id, tipo_gasto, descripcion, monto, fecha) VALUES
(1, 'diesel', 'Carga completa en Querétaro', 4500.00, '2026-01-15'),
(1, 'casetas', 'Casetas CDMX-Monterrey', 2800.00, '2026-01-15'),
(1, 'viaticos', 'Viáticos conductor', 1200.00, '2026-01-15'),
(2, 'diesel', 'Diesel en ruta', 3200.00, '2026-01-20'),
(2, 'casetas', 'Casetas Guadalajara-León', 850.00, '2026-01-20'),
(2, 'viaticos', 'Comidas y hospedaje', 900.00, '2026-01-20');

-- Mantenimiento
INSERT INTO mantenimiento (trailer_id, fecha, tipo, descripcion, kilometraje, costo_mano_obra, estado, taller) VALUES
(1, '2026-01-10', 'preventivo', 'Cambio de aceite y filtros', 145000.00, 800.00, 'completado', 'Taller Mecánico Central'),
(3, '2026-01-28', 'correctivo', 'Reparación de frenos', 87300.00, 1500.00, 'en_proceso', 'Taller Especializado');

-- Refacciones usadas en mantenimiento
INSERT INTO mantenimiento_refacciones (mantenimiento_id, refaccion_id, cantidad, precio_unitario) VALUES
(1, 1, 2, 450.00),
(1, 2, 1, 850.00),
(1, 5, 4, 350.00);
