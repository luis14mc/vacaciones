import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse } from '../../types';

// Configuración base de la API
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - agregar token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - manejo de errores globales
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          await this.handleTokenExpired();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async handleTokenExpired() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
  }

  private formatError(error: AxiosError): ApiResponse {
    const response = error.response;
    
    if (response?.data) {
      const data = response.data as any;
      
      // Si el backend devuelve un formato con 'error'
      if (data.error) {
        return {
          success: false,
          error: data.error,
          message: data.message || data.error,
        };
      }
      
      return data as ApiResponse;
    }

    return {
      success: false,
      error: error.message || 'Error de conexión con el servidor',
      message: 'Ha ocurrido un error inesperado',
    };
  }

  // Métodos HTTP públicos
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(endpoint, { params });
      
      // Adaptar respuesta del backend al formato esperado
      if (response.data.message && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Operación exitosa'
      };
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(endpoint, data);
      
      // Adaptar respuesta del backend al formato esperado
      if (response.data.message && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Operación exitosa'
      };
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(endpoint, data);
      
      // Adaptar respuesta del backend al formato esperado
      if (response.data.message && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      // Si la respuesta ya tiene el formato correcto
      if (response.data.success !== undefined) {
        return response.data;
      }
      
      // Formato por defecto si no hay estructura específica
      return {
        success: true,
        data: response.data,
        message: 'Operación exitosa'
      };
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(endpoint, data);
      
      // Adaptar respuesta del backend al formato esperado
      if (response.data.message && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      // Si la respuesta ya tiene el formato correcto
      if (response.data.success !== undefined) {
        return response.data;
      }
      
      // Formato por defecto si no hay estructura específica
      return {
        success: true,
        data: response.data,
        message: 'Operación exitosa'
      };
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(endpoint);
      
      // Adaptar respuesta del backend al formato esperado
      if (response.data.message && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      // Si la respuesta ya tiene el formato correcto
      if (response.data.success !== undefined) {
        return response.data;
      }
      
      // Formato por defecto si no hay estructura específica (como para eliminación)
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Operación exitosa'
      };
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // Método para configurar token manualmente
  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Método para limpiar autenticación
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }
}

// Instancia singleton del servicio API
export const apiService = new ApiService();
export default apiService;