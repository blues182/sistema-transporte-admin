-- Permitir mantenimientos para trailers y remolques
ALTER TABLE mantenimiento
    MODIFY COLUMN trailer_id INT NULL,
    ADD COLUMN unidad_tipo ENUM('trailer', 'remolque') DEFAULT 'trailer' AFTER id,
    ADD COLUMN remolque_id INT NULL AFTER trailer_id;

-- Mantener consistencia para registros existentes
UPDATE mantenimiento
SET unidad_tipo = 'trailer'
WHERE unidad_tipo IS NULL;

-- Agregar llave foranea para remolques
ALTER TABLE mantenimiento
    ADD CONSTRAINT fk_mantenimiento_remolque
    FOREIGN KEY (remolque_id) REFERENCES remolques(id);

-- Indices para consultas por tipo de unidad
CREATE INDEX idx_mantenimiento_remolque ON mantenimiento(remolque_id);
CREATE INDEX idx_mantenimiento_unidad_tipo ON mantenimiento(unidad_tipo);
