import { apiService } from './api';
import type { 
  AuthUser, 
  LoginCredentials, 
  AuthResponse, 
  ApiResponse 
} from '../../types';

export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  // Login del usuario
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        this.setAuthData(response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Error en el login');
    } catch (error) {
      throw error;
    }
  }

  // Logout del usuario
  async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout en el servidor
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      this.clearAuthData();
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    
    return !!(token && userData);
  }

  // Obtener datos del usuario actual
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    
    const userDataStr = localStorage.getItem(this.USER_DATA_KEY);
    if (!userDataStr) return null;
    
    try {
      return JSON.parse(userDataStr);
    } catch {
      return null;
    }
  }

  // Obtener token de autenticación
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  // Refrescar token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await apiService.post<AuthResponse>('/auth/refresh-token', {
        refreshToken
      });

      if (response.success && response.data) {
        this.setAuthData(response.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuthData();
      return false;
    }
  }

  // Verificar permisos de rol
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }

  // Verificar si es administrador
  isAdmin(): boolean {
    return this.hasRole('rrhh');
  }

  // Verificar si es jefe
  isManager(): boolean {
    return this.hasRole('jefe_superior');
  }

  // Verificar si es empleado
  isEmployee(): boolean {
    return this.hasRole('empleado');
  }

  // Verificar múltiples roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol) : false;
  }

  // Métodos privados
  private setAuthData(authData: AuthResponse): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.AUTH_TOKEN_KEY, authData.token);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(authData.user));
    
    if (authData.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    }

    // Configurar token en el servicio API
    apiService.setAuthToken(authData.token);
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    
    // Limpiar token del servicio API
    apiService.clearAuth();
  }

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      return await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  }

  // Solicitar reset de contraseña
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      return await apiService.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  }

  // Reset de contraseña con token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      return await apiService.post('/auth/reset-password', {
        token,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();
export default authService;