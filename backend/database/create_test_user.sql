-- Script para crear usuario de prueba
INSERT INTO usuarios (
    nombre,
    apellido,
    email,
    password_hash,
    rol,
    departamento,
    fecha_ingreso,
    dias_vacaciones_anuales,
    dias_vacaciones_disponibles,
    activo,
    created_at,
    updated_at
) VALUES (
    'Admin',
    'Sistema',
    'admin@cni.hn',
    '$2a$10$rqrqrqrqrqrqrqrqrqrqruOQ3P4F4F4F4F4F4F4F4F4F4F4F4F4F4F4',
    'rrhh',
    'Recursos Humanos',
    '2024-01-01',
    30,
    30,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Generar hash para password 'admin123'
-- El hash real será: $2a$10$K5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5R5