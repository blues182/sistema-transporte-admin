ALTER TABLE remolques
  ADD COLUMN poliza_nombre VARCHAR(255) NULL AFTER estado,
  ADD COLUMN poliza_mime VARCHAR(100) NULL AFTER poliza_nombre,
  ADD COLUMN poliza_pdf LONGBLOB NULL AFTER poliza_mime,
  ADD COLUMN poliza_updated_at TIMESTAMP NULL AFTER poliza_pdf;