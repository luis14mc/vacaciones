import { apiService } from './api';
import type { 
  VacationRequest, 
  VacationRequestFormData,
  VacationRequestUpdateData,
  VacationStats,
  ApiResponse
} from '../../types';

export class VacationService {

  // Obtener todas las solicitudes de vacaciones
  async getAllSolicitudes(params?: { 
    estado?: string; 
    usuario_id?: string 
  }): Promise<ApiResponse<VacationRequest[]>> {
    try {
      return await apiService.get<VacationRequest[]>('/vacaciones', params);
    } catch (error) {
      throw error;
    }
  }

  // Obtener una solicitud por ID
  async getSolicitudById(id: number): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.get<VacationRequest>(`/vacaciones/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva solicitud de vacaciones
  async createSolicitud(data: VacationRequestFormData): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.post<VacationRequest>('/vacaciones', data);
    } catch (error) {
      throw error;
    }
  }

  // Actualizar solicitud de vacaciones (aprobar/rechazar)
  async updateSolicitud(id: number, data: VacationRequestUpdateData): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.put<VacationRequest>(`/vacaciones/${id}`, data);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de solicitudes
  async getVacationStats(): Promise<ApiResponse<VacationStats>> {
    try {
      return await apiService.get<VacationStats>('/vacaciones/stats');
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE APROBACIÓN POR ROLES
  // ============================================

  // Aprobar solicitud por jefe
  async approveByJefe(id: number, comentarios?: string): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.post<VacationRequest>(`/vacaciones/${id}/approve-jefe`, {
        comentarios_jefe: comentarios
      });
    } catch (error) {
      throw error;
    }
  }

  // Rechazar solicitud por jefe
  async rejectByJefe(id: number, motivoRechazo: string): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.post<VacationRequest>(`/vacaciones/${id}/reject-jefe`, {
        motivo_rechazo: motivoRechazo
      });
    } catch (error) {
      throw error;
    }
  }

  // Aprobar solicitud por RRHH
  async approveByRRHH(id: number, comentarios?: string): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.post<VacationRequest>(`/vacaciones/${id}/approve-rrhh`, {
        comentarios_rrhh: comentarios
      });
    } catch (error) {
      throw error;
    }
  }

  // Rechazar solicitud por RRHH
  async rejectByRRHH(id: number, motivoRechazo: string): Promise<ApiResponse<VacationRequest>> {
    try {
      return await apiService.post<VacationRequest>(`/vacaciones/${id}/reject-rrhh`, {
        motivo_rechazo: motivoRechazo
      });
    } catch (error) {
      throw error;
    }
  }

  // Validar fechas de solicitud
  validateDates(fechaInicio: string, fechaFin: string): { valid: boolean; message?: string } {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    // Resetear horas para comparación de solo fechas
    hoy.setHours(0, 0, 0, 0);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (inicio < hoy) {
      return { valid: false, message: 'La fecha de inicio no puede ser anterior a hoy' };
    }

    if (fin < inicio) {
      return { valid: false, message: 'La fecha de fin no puede ser anterior a la fecha de inicio' };
    }

    return { valid: true };
  }

  // Calcular días solicitados (excluyendo fines de semana)
  calculateBusinessDays(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    let dias = 0;
    const currentDate = new Date(inicio);

    while (currentDate <= fin) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Domingo, 6 = Sábado
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dias++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dias;
  }

  // Formatear estado para mostrar
  formatStatus(estado: string): { text: string; color: string } {
    switch (estado) {
      case 'pendiente':
        return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
      case 'aprobada':
        return { text: 'Aprobada', color: 'bg-green-100 text-green-800' };
      case 'rechazada':
        return { text: 'Rechazada', color: 'bg-red-100 text-red-800' };
      default:
        return { text: estado, color: 'bg-gray-100 text-gray-800' };
    }
  }
}

// Instancia singleton del servicio
export const vacationService = new VacationService();
export default vacationService;