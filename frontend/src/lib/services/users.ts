import { apiService } from './api';
import type { 
  User, 
  UserFormData, 
  ApiResponse
} from '../../types';

export class UserService {
  
  // Función para mapear UserFormData al formato del backend
  private mapUserFormToBackend(userData: UserFormData): any {
    return {
      email: userData.email,
      password: userData.password,
      nombre: userData.nombre,
      apellido: userData.apellido,
      telefono: userData.telefono,
      rol: userData.rol,
      numeroEmpleado: userData.numeroEmpleado,
      jefeSuperiorId: userData.jefeSuperiorId,  // Cambiar de supervisor_id a jefeSuperiorId
      diasDisponibles: userData.diasDisponibles,  // Cambiar de dias_disponibles a diasDisponibles
      fechaContratacion: userData.fechaContratacion
    };
  }

  // Función para mapear datos de actualización
  private mapUpdateFormToBackend(userData: Partial<UserFormData>): any {
    const mapped: any = {};
    
    if (userData.email !== undefined) mapped.email = userData.email;
    if (userData.nombre !== undefined) mapped.nombre = userData.nombre;
    if (userData.apellido !== undefined) mapped.apellido = userData.apellido;
    if (userData.telefono !== undefined) mapped.telefono = userData.telefono;
    if (userData.rol !== undefined) mapped.rol = userData.rol;
    if (userData.numeroEmpleado !== undefined) mapped.numeroEmpleado = userData.numeroEmpleado;
    if (userData.jefeSuperiorId !== undefined) mapped.jefeSuperiorId = userData.jefeSuperiorId;  // Cambiar de supervisor_id a jefeSuperiorId
    if (userData.diasDisponibles !== undefined) mapped.diasDisponibles = userData.diasDisponibles;  // Cambiar de dias_disponibles a diasDisponibles
    if (userData.fechaContratacion !== undefined) mapped.fechaContratacion = userData.fechaContratacion;
    
    return mapped;
  }
  
  // Obtener todos los usuarios (solo para RRHH)
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    active?: boolean;
  }): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>('/users', params);
    } catch (error) {
      throw error;
    }
  }

  // Obtener un usuario por ID
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      return await apiService.get<User>(`/users/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // Crear nuevo usuario
  async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
    try {
      const mappedData = this.mapUserFormToBackend(userData);
      console.log('Creating user with data:', mappedData);
      return await apiService.post<User>('/users', mappedData);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  async updateUser(id: number, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
    try {
      const mappedData = this.mapUpdateFormToBackend(userData);
      console.log('Updating user with data:', mappedData);
      return await apiService.put<User>(`/users/${id}`, mappedData);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  async deleteUser(id: number): Promise<ApiResponse> {
    try {
      return await apiService.delete(`/users/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado activo/inactivo de usuario
  async toggleUserStatus(id: number, active: boolean): Promise<ApiResponse<User>> {
    try {
      return await apiService.patch<User>(`/users/${id}/status`, { activo: active });
    } catch (error) {
      throw error;
    }
  }

  // Obtener perfil del usuario actual
  async getCurrentUserProfile(): Promise<ApiResponse<User>> {
    try {
      return await apiService.get<User>('/users/perfil');
    } catch (error) {
      throw error;
    }
  }

  // Actualizar perfil del usuario actual
  async updateCurrentUserProfile(userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>('/users/perfil', userData);
    } catch (error) {
      throw error;
    }
  }

  // Obtener equipo del jefe (solo para jefes)
  async getTeamMembers(): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>('/users/mi-equipo');
    } catch (error) {
      throw error;
    }
  }

  // Obtener saldo de días del usuario actual
  async getCurrentUserDayBalance(): Promise<ApiResponse<{
    diasDisponibles: number;
    diasTomados: number;
    diasRestantes: number;
    diasPendientes: number;
  }>> {
    try {
      return await apiService.get('/users/mi-saldo-dias');
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuarios que pueden ser jefes (para asignación)
  async getPotentialManagers(): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>('/users/potential-managers');
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuarios por término
  async searchUsers(searchTerm: string): Promise<ApiResponse<User[]>> {
    try {
      return await apiService.get<User[]>('/users/search', {
        q: searchTerm
      });
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de usuarios (para dashboard)
  async getUserStats(): Promise<ApiResponse<{
    totalUsuarios: number;
    usuariosActivos: number;
    usuariosInactivos: number;
    usuariosPorRol: Record<string, number>;
    nuevosUsuariosEsteMes: number;
  }>> {
    try {
      return await apiService.get('/users/estadisticas');
    } catch (error) {
      throw error;
    }
  }

  // Exportar usuarios a CSV (solo para RRHH)
  async exportUsersToCSV(): Promise<Blob> {
    try {
      const response = await apiService.get('/users/export/csv');
      return new Blob([String(response.data)], { type: 'text/csv' });
    } catch (error) {
      throw error;
    }
  }

  // Importar usuarios desde CSV (solo para RRHH)
  async importUsersFromCSV(file: File): Promise<ApiResponse<{
    imported: number;
    errors: string[];
  }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      return await apiService.post('/users/import/csv', formData);
    } catch (error) {
      throw error;
    }
  }
}

// Instancia singleton del servicio de usuarios
export const userService = new UserService();
export default userService;