export interface User {
    id: number;
    email: string;
    password_hash: string;
    nombre: string;
    apellido: string;
    numero_empleado: string;
    telefono?: string;
    fecha_contratacion: Date;
    rol: 'empleado' | 'jefe_superior' | 'rrhh';
    jefe_superior_id?: number;
    dias_disponibles: number;
    dias_tomados: number;
    activo: boolean;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
}
export interface CreateUserDto {
    email: string;
    password_hash: string;
    nombre: string;
    apellido: string;
    numero_empleado: string;
    telefono?: string;
    fecha_contratacion: Date;
    rol?: 'empleado' | 'jefe_superior' | 'rrhh';
    jefe_superior_id?: number;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
    refreshToken: string;
}
export interface JWTPayload {
    userId: number;
    email: string;
    rol: string;
    iat?: number;
    exp?: number;
}
export interface SolicitudVacaciones {
    id: number;
    usuario_id: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    dias_solicitados: number;
    motivo: string;
    comentarios?: string;
    estado: 'pendiente_jefe' | 'pendiente_rrhh' | 'aprobada' | 'rechazada' | 'cancelada';
    aprobador_jefe_id?: number;
    fecha_aprobacion_jefe?: Date;
    comentarios_jefe?: string;
    aprobador_rrhh_id?: number;
    fecha_aprobacion_rrhh?: Date;
    comentarios_rrhh?: string;
    fecha_rechazo?: Date;
    motivo_rechazo?: string;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    usuario_nombre?: string;
    usuario_apellido?: string;
    usuario_numero_empleado?: string;
    jefe_nombre?: string;
    rrhh_nombre?: string;
}
export interface CreateSolicitudDto {
    fecha_inicio: Date;
    fecha_fin: Date;
    comentarios?: string;
}
export interface ApprovalDto {
    estado: 'aprobada' | 'rechazada';
    motivo_rechazo?: string;
}
