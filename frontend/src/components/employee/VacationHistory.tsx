import React, { useState, useEffect } from 'react';
import SweetAlert from '../../lib/utils/sweetAlert';
import vacationService from '../../lib/services/vacations';
import type { VacationRequest } from '../../types';

interface VacationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const VacationHistory: React.FC<VacationHistoryProps> = ({ isOpen, onClose }) => {
  const [solicitudes, setSolicitudes] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSolicitudes();
    }
  }, [isOpen]);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await vacationService.getAllSolicitudes();
      if (response.success && response.data) {
        // Ordenar por fecha más reciente primero
        const sortedSolicitudes = response.data.sort((a, b) => 
          new Date(b.fecha_solicitud).getTime() - new Date(a.fecha_solicitud).getTime()
        );
        setSolicitudes(sortedSolicitudes);
      }
    } catch (error: any) {
      console.error('Error loading solicitudes:', error);
      await SweetAlert.error('Error', 'No se pudo cargar el historial de solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (estado: string) => {
    const badges = {
      'pendiente_jefe': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente Jefe' },
      'pendiente_rrhh': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendiente RRHH' },
      'aprobada': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobada' },
      'rechazada': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazada' },
      'cancelada': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelada' }
    };
    
    const badge = badges[estado as keyof typeof badges] || badges.cancelada;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente_jefe':
      case 'pendiente_rrhh':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'aprobada':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'rechazada':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Mi Historial de Vacaciones</h3>
            <p className="text-sm text-gray-600 mt-1">
              {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} encontrada{solicitudes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          )}

          {!loading && solicitudes.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
              <p className="text-gray-600">Aún no has creado ninguna solicitud de vacaciones.</p>
            </div>
          )}

          {!loading && solicitudes.length > 0 && (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(solicitud.estado)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {formatDate(solicitud.fecha_inicio)} - {formatDate(solicitud.fecha_fin)}
                          </h4>
                          {getStatusBadge(solicitud.estado)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Días solicitados:</span>
                            <span className="ml-2 text-gray-900">{solicitud.dias_solicitados} días</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Fecha solicitud:</span>
                            <span className="ml-2 text-gray-900">{formatDate(solicitud.fecha_solicitud)}</span>
                          </div>
                          {solicitud.fecha_respuesta && (
                            <div>
                              <span className="font-medium text-gray-700">Fecha respuesta:</span>
                              <span className="ml-2 text-gray-900">{formatDate(solicitud.fecha_respuesta)}</span>
                            </div>
                          )}
                        </div>

                        {solicitud.motivo && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Motivo:</span>
                            <p className="text-gray-900 mt-1">{solicitud.motivo}</p>
                          </div>
                        )}

                        {solicitud.comentarios && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-blue-900">Comentarios:</span>
                            <p className="text-blue-800 mt-1">{solicitud.comentarios}</p>
                          </div>
                        )}

                        {solicitud.aprobador_nombre && (
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">
                              {solicitud.estado === 'aprobada' ? 'Aprobado' : 'Procesado'} por:
                            </span>
                            <span className="ml-2">{solicitud.aprobador_nombre}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationHistory;