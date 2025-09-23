-- Conectar a la base de datos y ejecutar manualmente
-- Ejecutar en el cliente de PostgreSQL

-- Verificar si la tabla ya existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'configuraciones'
);

-- Si no existe, crear la tabla y datos
CREATE TABLE IF NOT EXISTS configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'string',
    descripcion TEXT,
    categoria VARCHAR(100) DEFAULT 'general',
    es_editable BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones predeterminadas
INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_editable) VALUES 
('dias_anticipacion_minimo', '7', 'number', 'Días mínimos de anticipación para solicitar vacaciones', 'politicas_solicitud', true),
('dias_consecutivos_maximo', '15', 'number', 'Máximo de días consecutivos permitidos en una solicitud', 'politicas_solicitud', true),
('dias_consecutivos_minimo', '1', 'number', 'Mínimo de días por solicitud', 'politicas_solicitud', true),
('permitir_inicio_fin_semana', 'false', 'boolean', 'Permitir que las vacaciones inicien en fin de semana', 'politicas_solicitud', true),
('permitir_dias_festivos', 'true', 'boolean', 'Permitir solicitar días festivos como vacaciones', 'politicas_solicitud', true),
('dias_vacaciones_anuales', '22', 'number', 'Días de vacaciones anuales por empleado', 'limites_sistema', true),
('max_solicitudes_pendientes', '3', 'number', 'Máximo de solicitudes pendientes por empleado', 'limites_sistema', true),
('permitir_solicitudes_retroactivas', 'false', 'boolean', 'Permitir solicitudes con fechas pasadas', 'limites_sistema', true),
('requiere_aprobacion_jefe', 'true', 'boolean', 'Las solicitudes requieren aprobación del jefe inmediato', 'flujo_aprobacion', true),
('requiere_aprobacion_rrhh', 'true', 'boolean', 'Las solicitudes requieren aprobación final de RRHH', 'flujo_aprobacion', true),
('auto_aprobar_menos_dias', '0', 'number', 'Auto-aprobar solicitudes de X días o menos (0 = deshabilitado)', 'flujo_aprobacion', true),
('enviar_email_solicitud', 'true', 'boolean', 'Enviar email al crear solicitud', 'notificaciones', true),
('enviar_email_aprobacion', 'true', 'boolean', 'Enviar email al aprobar/rechazar', 'notificaciones', true),
('dias_recordatorio_aprobacion', '3', 'number', 'Días para recordar aprobaciones pendientes', 'notificaciones', true),
('nombre_empresa', 'Mi Empresa S.A.', 'string', 'Nombre de la empresa', 'empresa', true),
('año_fiscal_inicio', '01-01', 'string', 'Inicio del año fiscal (MM-DD)', 'empresa', true),
('zona_horaria', 'America/Mexico_City', 'string', 'Zona horaria de la empresa', 'empresa', true),
('dias_festivos', '["2025-01-01", "2025-12-25"]', 'json', 'Lista de días festivos fijos', 'calendario', true),
('dias_no_laborables', '["Saturday", "Sunday"]', 'json', 'Días de la semana no laborables', 'calendario', true)
ON CONFLICT (clave) DO NOTHING;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_configuraciones_clave ON configuraciones(clave);
CREATE INDEX IF NOT EXISTS idx_configuraciones_categoria ON configuraciones(categoria);
CREATE INDEX IF NOT EXISTS idx_configuraciones_es_editable ON configuraciones(es_editable);

-- Verificar que se insertaron los datos
SELECT COUNT(*) as total_configuraciones FROM configuraciones;
SELECT categoria, COUNT(*) as total FROM configuraciones GROUP BY categoria ORDER BY categoria;