-- Script para crear tablas adicionales del sistema de vacaciones CNI

-- Tabla de solicitudes de vacaciones
CREATE TABLE IF NOT EXISTS solicitudes_vacaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_solicitados INTEGER NOT NULL,
    motivo TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    aprobado_por INTEGER REFERENCES usuarios(id),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    comentarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL DEFAULT 'general',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de configuración
CREATE TABLE IF NOT EXISTS historial_configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario_id ON solicitudes_vacaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_vacaciones(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha_solicitud ON solicitudes_vacaciones(fecha_solicitud);
CREATE INDEX IF NOT EXISTS idx_configuracion_categoria ON configuracion_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_historial_clave ON historial_configuracion(clave);

-- Insertar configuraciones por defecto para vacaciones
INSERT INTO configuracion_sistema (clave, valor, descripcion, categoria) VALUES
    ('dias_maximos_por_solicitud', '30', 'Máximo número de días que se pueden solicitar en una sola petición', 'vacaciones'),
    ('dias_minimos_anticipo', '7', 'Días mínimos de anticipación para solicitar vacaciones', 'vacaciones'),
    ('dias_anuales_empleado', '20', 'Días de vacaciones anuales por empleado por defecto', 'vacaciones'),
    ('permite_fraccionamiento', 'true', 'Permite solicitar vacaciones en períodos fraccionados', 'vacaciones'),
    ('requiere_aprobacion_jefe', 'true', 'Requiere aprobación del jefe superior para todas las solicitudes', 'vacaciones'),
    ('notificaciones_email', 'true', 'Enviar notificaciones por email', 'vacaciones')
ON CONFLICT (clave) DO NOTHING;

-- Insertar configuraciones por defecto para el sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion, categoria) VALUES
    ('sesion_duracion_minutos', '480', 'Duración de la sesión en minutos (8 horas)', 'sistema'),
    ('max_intentos_login', '3', 'Máximo número de intentos de login antes del bloqueo', 'sistema'),
    ('bloqueo_duracion_minutos', '30', 'Duración del bloqueo tras exceder intentos de login', 'sistema'),
    ('backup_automatico', 'true', 'Realizar backup automático de la base de datos', 'sistema'),
    ('logs_nivel', 'info', 'Nivel de logging del sistema', 'sistema')
ON CONFLICT (clave) DO NOTHING;

-- Trigger para actualizar fecha de modificación en configuracion_sistema
CREATE OR REPLACE FUNCTION update_configuracion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    
    -- Insertar en historial si el valor cambió
    IF OLD.valor != NEW.valor THEN
        INSERT INTO historial_configuracion (clave, valor_anterior, valor_nuevo, usuario_id)
        VALUES (NEW.clave, OLD.valor, NEW.valor, NULL);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configuracion_timestamp
    BEFORE UPDATE ON configuracion_sistema
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracion_timestamp();

-- Trigger para actualizar fecha de modificación en solicitudes_vacaciones
CREATE OR REPLACE FUNCTION update_solicitudes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solicitudes_timestamp
    BEFORE UPDATE ON solicitudes_vacaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_solicitudes_timestamp();

-- Añadir columnas que podrían faltar en la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS dias_disponibles INTEGER DEFAULT 20;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS departamento VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS supervisor_id INTEGER REFERENCES usuarios(id);

-- Comentarios en las tablas para documentación
COMMENT ON TABLE solicitudes_vacaciones IS 'Tabla que almacena todas las solicitudes de vacaciones de los empleados';
COMMENT ON TABLE configuracion_sistema IS 'Tabla que almacena la configuración general del sistema';
COMMENT ON TABLE historial_configuracion IS 'Tabla que registra todos los cambios en la configuración del sistema';

COMMENT ON COLUMN solicitudes_vacaciones.estado IS 'Estado de la solicitud: pendiente, aprobada, rechazada';
COMMENT ON COLUMN configuracion_sistema.categoria IS 'Categoría de la configuración: vacaciones, sistema, etc.';

-- Crear vista para estadísticas rápidas
CREATE OR REPLACE VIEW vista_estadisticas_solicitudes AS
SELECT 
    COUNT(*) as total_solicitudes,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
    COUNT(*) FILTER (WHERE estado = 'aprobada') as aprobadas,
    COUNT(*) FILTER (WHERE estado = 'rechazada') as rechazadas,
    AVG(dias_solicitados) as promedio_dias,
    SUM(dias_solicitados) FILTER (WHERE estado = 'aprobada') as total_dias_aprobados
FROM solicitudes_vacaciones;

-- Crear vista para estadísticas de usuarios
CREATE OR REPLACE VIEW vista_estadisticas_usuarios AS
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(*) FILTER (WHERE activo = true) as usuarios_activos,
    COUNT(*) FILTER (WHERE rol = 'empleado') as empleados,
    COUNT(*) FILTER (WHERE rol = 'jefe_superior') as jefes_superiores,
    COUNT(*) FILTER (WHERE rol = 'rrhh') as rrhh,
    COUNT(DISTINCT departamento) FILTER (WHERE departamento IS NOT NULL) as departamentos,
    AVG(dias_disponibles) as promedio_dias_disponibles
FROM usuarios;

-- Permisos y seguridad
-- (Los permisos específicos se configurarán según el usuario de la base de datos)

-- Log de ejecución
INSERT INTO configuracion_sistema (clave, valor, descripcion, categoria) VALUES
    ('db_schema_version', '1.0.0', 'Versión del esquema de base de datos', 'sistema'),
    ('db_last_update', CURRENT_TIMESTAMP::text, 'Última actualización de la base de datos', 'sistema')
ON CONFLICT (clave) DO UPDATE SET 
    valor = EXCLUDED.valor,
    fecha_actualizacion = CURRENT_TIMESTAMP;