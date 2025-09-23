-- Migración para agregar columna numero_empleado a la tabla usuarios

-- Agregar la columna numero_empleado
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_empleado VARCHAR(20);

-- Crear índice para búsquedas rápidas por número de empleado
CREATE INDEX IF NOT EXISTS idx_usuarios_numero_empleado ON usuarios(numero_empleado);