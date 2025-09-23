import React, { useState, useEffect } from 'react';
import { SweetAlert } from '../../lib/utils/sweetAlert';
import vacationService from '../../lib/services/vacations';
import type { VacationRequest, VacationRequestFormData, VacationRequestUpdateData } from '../../types';

const VacationRequestsCRUD: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<VacationRequest[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState<VacationRequest | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');

  // Estado del formulario
  const [formData, setFormData] = useState<VacationRequestFormData>({
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  });

  // Estado del formulario de actualización
  const [updateData, setUpdateData] = useState<VacationRequestUpdateData>({
    estado: 'pendiente',
    comentarios: ''
  });

  useEffect(() => {
    loadSolicitudes();
  }, []);

  useEffect(() => {
    filterSolicitudes();
  }, [solicitudes, searchTerm, statusFilter]);

  // Cargar solicitudes
  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await vacationService.getAllSolicitudes();
      if (response.success && response.data) {
        setSolicitudes(response.data);
      }
    } catch (error: any) {
      console.error('Error loading vacation requests:', error);
      await SweetAlert.error('Error al cargar', 'No se pudieron cargar las solicitudes de vacaciones');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solicitudes
  const filterSolicitudes = () => {
    let filtered = solicitudes;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(solicitud =>
        solicitud.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitud.usuario_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (solicitud.motivo && solicitud.motivo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(solicitud => solicitud.estado === statusFilter);
    }

    setFilteredSolicitudes(filtered);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (viewMode === 'edit') {
      setUpdateData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validar formulario de creación
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

    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (viewMode === 'create') {
      // Crear nueva solicitud
      if (!validateForm()) return;

      try {
        SweetAlert.loading('Creando solicitud...');
        const response = await vacationService.createSolicitud(formData);
        
        SweetAlert.close();
        
        if (response.success) {
          await SweetAlert.success('¡Solicitud creada!', 'La solicitud de vacaciones ha sido creada correctamente');
          await loadSolicitudes();
          handleCloseModal();
        } else {
          await SweetAlert.error('Error al crear', response.message || 'Error al crear la solicitud');
        }
      } catch (error: any) {
        SweetAlert.close();
        await SweetAlert.error('Error inesperado', error.message || 'Error al crear la solicitud');
      }
    } else if (viewMode === 'edit' && editingSolicitud) {
      // Actualizar solicitud (aprobar/rechazar)
      try {
        SweetAlert.loading('Actualizando solicitud...');
        const response = await vacationService.updateSolicitud(editingSolicitud.id, updateData);
        
        SweetAlert.close();
        
        if (response.success) {
          await SweetAlert.success('¡Solicitud actualizada!', 'La solicitud ha sido actualizada correctamente');
          await loadSolicitudes();
          handleCloseModal();
        } else {
          await SweetAlert.error('Error al actualizar', response.message || 'Error al actualizar la solicitud');
        }
      } catch (error: any) {
        SweetAlert.close();
        await SweetAlert.error('Error inesperado', error.message || 'Error al actualizar la solicitud');
      }
    }
  };

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setViewMode('create');
    setEditingSolicitud(null);
    setFormData({
      fecha_inicio: '',
      fecha_fin: '',
      motivo: ''
    });
    setShowModal(true);
  };

  // Abrir modal para editar/aprobar
  const handleOpenEditModal = (solicitud: VacationRequest) => {
    setViewMode('edit');
    setEditingSolicitud(solicitud);
    setUpdateData({
      estado: solicitud.estado,
      comentarios: solicitud.comentarios || ''
    });
    setShowModal(true);
  };

  // Abrir modal para ver detalles
  const handleOpenViewModal = (solicitud: VacationRequest) => {
    setViewMode('view');
    setEditingSolicitud(solicitud);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSolicitud(null);
    setViewMode('create');
  };

  // Calcular días solicitados
  const calculateDays = (fechaInicio: string, fechaFin: string): number => {
    if (!fechaInicio || !fechaFin) return 0;
    return vacationService.calculateBusinessDays(fechaInicio, fechaFin);
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y botón */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Solicitudes de Vacaciones</h1>
          <p className="text-gray-600">Administrar solicitudes de días de vacaciones</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Solicitud
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSolicitudes.length > 0 ? (
                filteredSolicitudes.map((solicitud) => {
                  const statusFormat = vacationService.formatStatus(solicitud.estado);
                  return (
                    <tr key={solicitud.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {solicitud.usuario_nombre} {solicitud.usuario_apellido}
                          </div>
                          {solicitud.usuario_departamento && (
                            <div className="text-sm text-gray-500">
                              {solicitud.usuario_departamento}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatDate(solicitud.fecha_inicio)}</div>
                          <div className="text-gray-500">a {formatDate(solicitud.fecha_fin)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solicitud.dias_solicitados} días
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusFormat.color}`}>
                          {statusFormat.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(solicitud.fecha_solicitud)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {/* Botón Ver */}
                          <button
                            onClick={() => handleOpenViewModal(solicitud)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Ver detalles"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Botón Gestionar (solo para pendientes) */}
                          {solicitud.estado === 'pendiente' && (
                            <button
                              onClick={() => handleOpenEditModal(solicitud)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                              title="Aprobar/Rechazar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron solicitudes de vacaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {viewMode === 'create' && 'Nueva Solicitud de Vacaciones'}
                {viewMode === 'edit' && 'Gestionar Solicitud'}
                {viewMode === 'view' && 'Detalles de la Solicitud'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              {viewMode === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleInputChange}
                      min={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {formData.fecha_inicio && formData.fecha_fin && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Días solicitados: <strong>{calculateDays(formData.fecha_inicio, formData.fecha_fin)} días hábiles</strong>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo
                    </label>
                    <textarea
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Opcional: describe el motivo de la solicitud"
                    />
                  </div>
                </div>
              )}

              {viewMode === 'edit' && editingSolicitud && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Detalles de la Solicitud</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Empleado:</strong> {editingSolicitud.usuario_nombre} {editingSolicitud.usuario_apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Fechas:</strong> {formatDate(editingSolicitud.fecha_inicio)} - {formatDate(editingSolicitud.fecha_fin)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Días:</strong> {editingSolicitud.dias_solicitados} días
                    </p>
                    {editingSolicitud.motivo && (
                      <p className="text-sm text-gray-600">
                        <strong>Motivo:</strong> {editingSolicitud.motivo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Decisión *
                    </label>
                    <select
                      name="estado"
                      value={updateData.estado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobada">Aprobar</option>
                      <option value="rechazada">Rechazar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentarios
                    </label>
                    <textarea
                      name="comentarios"
                      value={updateData.comentarios}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Opcional: comentarios sobre la decisión"
                    />
                  </div>
                </div>
              )}

              {viewMode === 'view' && editingSolicitud && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Empleado</p>
                      <p className="text-sm text-gray-900">{editingSolicitud.usuario_nombre} {editingSolicitud.usuario_apellido}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estado</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vacationService.formatStatus(editingSolicitud.estado).color}`}>
                        {vacationService.formatStatus(editingSolicitud.estado).text}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha Inicio</p>
                      <p className="text-sm text-gray-900">{formatDate(editingSolicitud.fecha_inicio)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha Fin</p>
                      <p className="text-sm text-gray-900">{formatDate(editingSolicitud.fecha_fin)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Días Solicitados</p>
                      <p className="text-sm text-gray-900">{editingSolicitud.dias_solicitados} días</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha Solicitud</p>
                      <p className="text-sm text-gray-900">{formatDate(editingSolicitud.fecha_solicitud)}</p>
                    </div>
                  </div>
                  
                  {editingSolicitud.motivo && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Motivo</p>
                      <p className="text-sm text-gray-900">{editingSolicitud.motivo}</p>
                    </div>
                  )}
                  
                  {editingSolicitud.comentarios && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Comentarios</p>
                      <p className="text-sm text-gray-900">{editingSolicitud.comentarios}</p>
                    </div>
                  )}
                  
                  {editingSolicitud.aprobador_nombre && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Aprobado/Rechazado por</p>
                      <p className="text-sm text-gray-900">{editingSolicitud.aprobador_nombre}</p>
                    </div>
                  )}
                  
                  {editingSolicitud.fecha_respuesta && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha de Respuesta</p>
                      <p className="text-sm text-gray-900">{formatDate(editingSolicitud.fecha_respuesta)}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {viewMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {viewMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {viewMode === 'create' ? 'Crear Solicitud' : 'Actualizar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationRequestsCRUD;