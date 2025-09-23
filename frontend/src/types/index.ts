// Tipos de usuario y roles
export type UserRole = 'empleado' | 'jefe_superior' | 'rrhh';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  numeroEmpleado: string;
  telefono?: string;
  fechaContratacion: string;
  rol: UserRole;
  jefeSuperiorId?: number;
  diasDisponibles: number;
  diasTomados: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Tipos de solicitudes de vacaciones (sincronizado con backend)
export type VacationRequestStatus = 'pendiente_jefe' | 'pendiente_rrhh' | 'aprobada' | 'rechazada' | 'cancelada';

export interface VacationRequest {
  id: number;
  usuario_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias_solicitados: number;
  motivo?: string;
  estado: VacationRequestStatus;
  aprobado_por?: number;
  fecha_solicitud: string;
  fecha_respuesta?: string;
  comentarios?: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_departamento?: string;
  aprobador_nombre?: string;
}

// Tipos de ajustes de días
export type AdjustmentType = 'asignacion_anual' | 'bonus' | 'penalizacion' | 'correccion';

export interface DayAdjustment {
  id: number;
  usuarioId: number;
  tipoAjuste: AdjustmentType;
  diasAjuste: number;
  motivo: string;
  fechaEfectiva: string;
  creadoPorId: number;
  fechaCreacion: string;
  usuario?: User;
  creadoPor?: User;
}

// Tipos de días feriados
export interface Holiday {
  id: number;
  nombre: string;
  fecha: string;
  activo: boolean;
  fechaCreacion: string;
}

// Tipos de autenticación
export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  numeroEmpleado: string;
  rol: UserRole;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

// Tipos de dashboard
export interface DashboardStats {
  totalEmpleados: number;
  solicitudesPendientes: number;
  solicitudesAprobadas: number;
  solicitudesRechazadas: number;
  empleadosConVacaciones: number;
}

// Tipos de API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de formularios
export interface UserFormData {
  nombre: string;
  apellido: string;
  email: string;
  numeroEmpleado: string;
  telefono?: string;
  fechaContratacion: string;
  rol: UserRole;
  jefeSuperiorId?: number;
  diasDisponibles: number;
  password?: string;
}

export interface VacationRequestFormData {
  fecha_inicio: string;
  fecha_fin: string;
  motivo?: string;
}

export interface VacationRequestUpdateData {
  estado: VacationRequestStatus;
  comentarios?: string;
}

export interface VacationStats {
  total_solicitudes: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  total_dias_aprobados: number;
}

export interface DayAdjustmentFormData {
  usuarioId: number;
  tipoAjuste: AdjustmentType;
  diasAjuste: number;
  motivo: string;
  fechaEfectiva: string;
}

// Tipos de notificaciones
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

// Tipos de configuración
export interface AppConfig {
  apiUrl: string;
  authTokenKey: string;
  refreshTokenKey: string;
  companyName: string;
  appVersion: string;
}