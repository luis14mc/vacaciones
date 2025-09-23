import React, { useState } from 'react';
import SweetAlert from '../../lib/utils/sweetAlert';
import vacationService from '../../lib/services/vacations';
import type { VacationRequestFormData } from '../../types';

interface VacationRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userDaysAvailable: number;
}

const VacationRequestForm: React.FC<VacationRequestFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userDaysAvailable
}) => {
  const [formData, setFormData] = useState<VacationRequestFormData>({
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = (fechaInicio: string, fechaFin: string): number => {
    if (!fechaInicio || !fechaFin) return 0;
    return vacationService.calculateBusinessDays(fechaInicio, fechaFin);
  };

  const validateForm = (): boolean => {
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      SweetAlert.error('Campos requeridos', 'Por favor completa las fechas de inicio y fin');
      return false;
    }

    const validation = vacationService.validateDates(formData.fecha_inicio, formData.fecha_fin);
    if (!validation.valid) {
      SweetAlert.error('Fechas inválidas', validation.message || 'Las fechas no son válidas');
      return false;
    }

    const diasSolicitados = calculateDays(formData.fecha_inicio, formData.fecha_fin);
    if (diasSolicitados > userDaysAvailable) {
      SweetAlert.error(
        'Días insuficientes', 
        `Solo tienes ${userDaysAvailable} días disponibles. Estás solicitando ${diasSolicitados} días.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      SweetAlert.loading('Creando solicitud...');
      
      const response = await vacationService.createSolicitud(formData);
      
      SweetAlert.close();
      
      if (response.success) {
        await SweetAlert.success(
          '¡Solicitud creada!', 
          'Tu solicitud de vacaciones ha sido enviada para aprobación. Recibirás una notificación cuando sea revisada.'
        );
        
        // Limpiar formulario
        setFormData({
          fecha_inicio: '',
          fecha_fin: '',
          motivo: ''
        });
        
        onSuccess();
        onClose();
      } else {
        await SweetAlert.error('Error al crear', response.message || 'Error al crear la solicitud');
      }
    } catch (error: any) {
      SweetAlert.close();
      await SweetAlert.error('Error inesperado', error.message || 'Error al crear la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        fecha_inicio: '',
        fecha_fin: '',
        motivo: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const diasSolicitados = calculateDays(formData.fecha_inicio, formData.fecha_fin);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Nueva Solicitud de Vacaciones</h3>
            <p className="text-sm text-gray-600 mt-1">Días disponibles: {userDaysAvailable}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fecha de Inicio */}
          <div>
            <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              id="fecha_inicio"
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>

          {/* Fecha de Fin */}
          <div>
            <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              id="fecha_fin"
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleInputChange}
              min={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>

          {/* Resumen de días */}
          {formData.fecha_inicio && formData.fecha_fin && (
            <div className={`p-4 rounded-lg border-2 ${
              diasSolicitados <= userDaysAvailable 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Días solicitados:</span>
                <span className={`text-lg font-bold ${
                  diasSolicitados <= userDaysAvailable ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {diasSolicitados} días hábiles
                </span>
              </div>
              {diasSolicitados > userDaysAvailable && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ Excedes tus días disponibles ({userDaysAvailable} días)
                </p>
              )}
            </div>
          )}

          {/* Motivo */}
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo (Opcional)
            </label>
            <textarea
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 resize-none"
              placeholder="Describe el motivo de tu solicitud (vacaciones familiares, descanso personal, etc.)"
            />
          </div>

          {/* Información importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>La solicitud será enviada primero a tu jefe superior</li>
                  <li>Una vez aprobada por tu jefe, pasará a RRHH</li>
                  <li>Solo se cuentan días hábiles (lunes a viernes)</li>
                  <li>Recibirás notificaciones del estado de tu solicitud</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || diasSolicitados > userDaysAvailable}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationRequestForm;