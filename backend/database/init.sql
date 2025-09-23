# Modelo de Base de Datos
## Sistema de Gestión de Solicitudes de Vacaciones

### Diagrama de Entidades y Relaciones

```sql
-- =============================================
-- TABLA DE USUARIOS
-- =============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    numero_empleado VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_contratacion DATE NOT NULL,
    rol ENUM('empleado', 'jefe_superior', 'rrhh') NOT NULL DEFAULT 'empleado',
    jefe_superior_id INTEGER REFERENCES usuarios(id),
    dias_disponibles DECIMAL(5,2) DEFAULT 0,
    dias_tomados DECIMAL(5,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_email (email),
    INDEX idx_numero_empleado (numero_empleado),
    INDEX idx_jefe_superior (jefe_superior_id),
    INDEX idx_rol (rol)
);

-- =============================================
-- TABLA DE SOLICITUDES DE VACACIONES
-- =============================================
CREATE TABLE solicitudes_vacaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_solicitados DECIMAL(5,2) NOT NULL,
    comentarios TEXT,
    estado ENUM(
        'pendiente_jefe',
        'pendiente_rrhh', 
        'aprobada',
        'rechazada',
        'cancelada'
    ) NOT NULL DEFAULT 'pendiente_jefe',
    motivo_rechazo TEXT,
    aprobado_por_jefe_id INTEGER REFERENCES usuarios(id),
    fecha_aprobacion_jefe TIMESTAMP,
    aprobado_por_rrhh_id INTEGER REFERENCES usuarios(id),
    fecha_aprobacion_rrhh TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fechas (fecha_inicio, fecha_fin),
    INDEX idx_fecha_creacion (fecha_creacion),
    
    -- Constraints
    CHECK (fecha_fin >= fecha_inicio),
    CHECK (dias_solicitados > 0)
);

-- =============================================
-- TABLA DE DÍAS FERIADOS
-- =============================================
CREATE TABLE dias_feriados (
    id SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    tipo ENUM('nacional', 'local', 'empresa') DEFAULT 'nacional',
    activo BOOLEAN DEFAULT TRUE,
    creado_por_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_fecha (fecha),
    INDEX idx_activo (activo)
);

-- =============================================
-- TABLA DE BITÁCORA/AUDIT TRAIL
-- =============================================
CREATE TABLE bitacora (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    solicitud_id INTEGER REFERENCES solicitudes_vacaciones(id),
    accion ENUM(
        'crear_solicitud',
        'aprobar_jefe',
        'aprobar_rrhh',
        'rechazar_solicitud',
        'cancelar_solicitud',
        'ajustar_dias_vacaciones',
        'crear_usuario',
        'actualizar_usuario',
        'login',
        'logout'
    ) NOT NULL,
    descripcion TEXT NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_usuario_bitacora (usuario_id),
    INDEX idx_solicitud_bitacora (solicitud_id),
    INDEX idx_accion (accion),
    INDEX idx_fecha_accion (fecha_accion)
);

-- =============================================
-- TABLA DE AJUSTES DE DÍAS DE VACACIONES
-- =============================================
CREATE TABLE ajustes_dias_vacaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_ajuste ENUM('asignacion_anual', 'bonus', 'penalizacion', 'correccion') NOT NULL,
    dias_anteriores DECIMAL(5,2) NOT NULL,
    dias_ajuste DECIMAL(5,2) NOT NULL,
    dias_nuevos DECIMAL(5,2) NOT NULL,
    motivo TEXT NOT NULL,
    creado_por_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha_efectiva DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_usuario_ajustes (usuario_id),
    INDEX idx_tipo_ajuste (tipo_ajuste),
    INDEX idx_fecha_efectiva (fecha_efectiva)
);

-- =============================================
-- TABLA DE NOTIFICACIONES
-- =============================================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_destinatario_id INTEGER NOT NULL REFERENCES usuarios(id),
    solicitud_id INTEGER REFERENCES solicitudes_vacaciones(id),
    tipo ENUM(
        'nueva_solicitud',
        'solicitud_aprobada',
        'solicitud_rechazada',
        'solicitud_cancelada',
        'recordatorio_pendiente'
    ) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    enviada_por_email BOOLEAN DEFAULT FALSE,
    fecha_envio_email TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices
    INDEX idx_usuario_notif (usuario_destinatario_id),
    INDEX idx_solicitud_notif (solicitud_id),
    INDEX idx_leida (leida),
    INDEX idx_tipo_notif (tipo)
);

-- =============================================
-- VISTA PARA DASHBOARDS
-- =============================================
CREATE VIEW vista_solicitudes_detalle AS
SELECT 
    s.id,
    s.usuario_id,
    u.nombre,
    u.apellido,
    u.numero_empleado,
    s.fecha_inicio,
    s.fecha_fin,
    s.dias_solicitados,
    s.estado,
    s.comentarios,
    s.motivo_rechazo,
    s.fecha_creacion,
    jefe.nombre as jefe_nombre,
    jefe.apellido as jefe_apellido,
    rrhh.nombre as rrhh_nombre,
    rrhh.apellido as rrhh_apellido
FROM solicitudes_vacaciones s
JOIN usuarios u ON s.usuario_id = u.id
LEFT JOIN usuarios jefe ON s.aprobado_por_jefe_id = jefe.id
LEFT JOIN usuarios rrhh ON s.aprobado_por_rrhh_id = rrhh.id;

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar la fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática
CREATE TRIGGER tr_usuarios_actualizar 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER tr_solicitudes_actualizar 
    BEFORE UPDATE ON solicitudes_vacaciones 
    FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Función para registrar en bitácora automáticamente
CREATE OR REPLACE FUNCTION registrar_bitacora_solicitudes()
RETURNS TRIGGER AS $$
BEGIN
    -- Para inserts
    IF TG_OP = 'INSERT' THEN
        INSERT INTO bitacora (usuario_id, solicitud_id, accion, descripcion, datos_nuevos)
        VALUES (NEW.usuario_id, NEW.id, 'crear_solicitud', 
                'Nueva solicitud de vacaciones creada', 
                row_to_json(NEW));
        RETURN NEW;
    END IF;
    
    -- Para updates (cambio de estado)
    IF TG_OP = 'UPDATE' AND OLD.estado != NEW.estado THEN
        CASE NEW.estado
            WHEN 'pendiente_rrhh' THEN
                INSERT INTO bitacora (usuario_id, solicitud_id, accion, descripcion, datos_anteriores, datos_nuevos)
                VALUES (NEW.aprobado_por_jefe_id, NEW.id, 'aprobar_jefe', 
                        'Solicitud aprobada por jefe superior', 
                        row_to_json(OLD), row_to_json(NEW));
            WHEN 'aprobada' THEN
                INSERT INTO bitacora (usuario_id, solicitud_id, accion, descripcion, datos_anteriores, datos_nuevos)
                VALUES (NEW.aprobado_por_rrhh_id, NEW.id, 'aprobar_rrhh', 
                        'Solicitud aprobada por RRHH', 
                        row_to_json(OLD), row_to_json(NEW));
            WHEN 'rechazada' THEN
                INSERT INTO bitacora (usuario_id, solicitud_id, accion, descripcion, datos_anteriores, datos_nuevos)
                VALUES (COALESCE(NEW.aprobado_por_rrhh_id, NEW.aprobado_por_jefe_id), NEW.id, 'rechazar_solicitud', 
                        'Solicitud rechazada', 
                        row_to_json(OLD), row_to_json(NEW));
            WHEN 'cancelada' THEN
                INSERT INTO bitacora (usuario_id, solicitud_id, accion, descripcion, datos_anteriores, datos_nuevos)
                VALUES (NEW.usuario_id, NEW.id, 'cancelar_solicitud', 
                        'Solicitud cancelada por el empleado', 
                        row_to_json(OLD), row_to_json(NEW));
        END CASE;
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_bitacora_solicitudes 
    AFTER INSERT OR UPDATE ON solicitudes_vacaciones 
    FOR EACH ROW EXECUTE FUNCTION registrar_bitacora_solicitudes();
