-- Crear tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    descripcion TEXT,
    categoria VARCHAR(100) DEFAULT 'general',
    es_editable BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones predeterminadas del sistema de vacaciones
INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_editable) VALUES 

-- Políticas de solicitud
('dias_anticipacion_minimo', '7', 'number', 'Días mínimos de anticipación para solicitar vacaciones', 'politicas_solicitud', true),
('dias_consecutivos_maximo', '15', 'number', 'Máximo de días consecutivos permitidos en una solicitud', 'politicas_solicitud', true),
('dias_consecutivos_minimo', '1', 'number', 'Mínimo de días por solicitud', 'politicas_solicitud', true),
('permitir_inicio_fin_semana', 'false', 'boolean', 'Permitir que las vacaciones inicien en fin de semana', 'politicas_solicitud', true),
('permitir_dias_festivos', 'true', 'boolean', 'Permitir solicitar días festivos como vacaciones', 'politicas_solicitud', true),

-- Límites de sistema
('dias_vacaciones_anuales', '22', 'number', 'Días de vacaciones anuales por empleado', 'limites_sistema', true),
('max_solicitudes_pendientes', '3', 'number', 'Máximo de solicitudes pendientes por empleado', 'limites_sistema', true),
('permitir_solicitudes_retroactivas', 'false', 'boolean', 'Permitir solicitudes con fechas pasadas', 'limites_sistema', true),

-- Configuración de aprobaciones
('requiere_aprobacion_jefe', 'true', 'boolean', 'Las solicitudes requieren aprobación del jefe inmediato', 'flujo_aprobacion', true),
('requiere_aprobacion_rrhh', 'true', 'boolean', 'Las solicitudes requieren aprobación final de RRHH', 'flujo_aprobacion', true),
('auto_aprobar_menos_dias', '0', 'number', 'Auto-aprobar solicitudes de X días o menos (0 = deshabilitado)', 'flujo_aprobacion', true),

-- Notificaciones
('enviar_email_solicitud', 'true', 'boolean', 'Enviar email al crear solicitud', 'notificaciones', true),
('enviar_email_aprobacion', 'true', 'boolean', 'Enviar email al aprobar/rechazar', 'notificaciones', true),
('dias_recordatorio_aprobacion', '3', 'number', 'Días para recordar aprobaciones pendientes', 'notificaciones', true),

-- Configuración de empresa
('nombre_empresa', 'Mi Empresa S.A.', 'string', 'Nombre de la empresa', 'empresa', true),
('año_fiscal_inicio', '01-01', 'string', 'Inicio del año fiscal (MM-DD)', 'empresa', true),
('zona_horaria', 'America/Mexico_City', 'string', 'Zona horaria de la empresa', 'empresa', true),

-- Días especiales y festivos
('dias_festivos', '["2025-01-01", "2025-12-25"]', 'json', 'Lista de días festivos fijos', 'calendario', true),
('dias_no_laborables', '["Saturday", "Sunday"]', 'json', 'Días de la semana no laborables', 'calendario', true);

-- Índices para optimizar consultas
CREATE INDEX idx_configuraciones_clave ON configuraciones(clave);
CREATE INDEX idx_configuraciones_categoria ON configuraciones(categoria);
CREATE INDEX idx_configuraciones_es_editable ON configuraciones(es_editable);

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_configuraciones_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_configuraciones_update 
    BEFORE UPDATE ON configuraciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_configuraciones_timestamp();