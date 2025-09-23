import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  descripcion?: string;
  categoria: string;
  es_editable: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface Categoria {
  categoria: string;
  total_configuraciones: number;
}

const ConfigurationManager: React.FC = () => {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Configuracion | null>(null);

  const API_BASE_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetchCategorias();
    fetchConfiguraciones();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada) {
      fetchConfiguracionesByCategoria(categoriaSeleccionada);
    } else {
      fetchConfiguraciones();
    }
  }, [categoriaSeleccionada]);

  const fetchConfiguraciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      console.log('🔄 Obteniendo configuraciones...');
      const response = await fetch(`${API_BASE_URL}/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Configuraciones obtenidas:', data.data?.length || 0);
      setConfiguraciones(data.data || []);
    } catch (err) {
      console.error('❌ Error obteniendo configuraciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.warn('⚠️ No se encontró token para obtener categorías');
        return;
      }
      
      console.log('🔄 Obteniendo categorías...');
      const response = await fetch(`${API_BASE_URL}/config/categorias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('⚠️ Error obteniendo categorías:', errorData.message || response.statusText);
        return;
      }

      const data = await response.json();
      console.log('✅ Categorías obtenidas:', data.data?.length || 0);
      setCategorias(data.data || []);
    } catch (err) {
      console.error('❌ Error al cargar categorías:', err);
    }
  };

  const fetchConfiguracionesByCategoria = async (categoria: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/config/categoria/${categoria}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener configuraciones por categoría');
      }

      const data = await response.json();
      setConfiguraciones(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (clave: string, valor: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      console.log(`🔄 Actualizando configuración: ${clave} = ${valor}`);
      
      // Mostrar loading
      Swal.fire({
        title: 'Guardando cambios...',
        text: `Actualizando ${clave}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(`${API_BASE_URL}/config/${clave}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Configuración ${clave} actualizada exitosamente`);
      
      // Mostrar éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Cambio guardado!',
        text: `La configuración "${clave}" se actualizó correctamente`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      await fetchConfiguraciones();
      setEditingConfig(null);
    } catch (err) {
      console.error('❌ Error actualizando configuración:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar');
      
      // Mostrar error
      await Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err instanceof Error ? err.message : 'No se pudo actualizar la configuración',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const renderValueEditor = (config: Configuracion) => {
    if (!config.es_editable) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800">{config.valor}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
            Solo lectura
          </span>
        </div>
      );
    }

    if (editingConfig?.id === config.id) {
      const renderInput = () => {
        if (config.tipo === 'boolean') {
          return (
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              defaultValue={config.valor}
              onChange={(e) => {
                const newConfig = { ...editingConfig, valor: e.target.value };
                setEditingConfig(newConfig);
              }}
            >
              <option value="true">✅ Verdadero</option>
              <option value="false">❌ Falso</option>
            </select>
          );
        } else if (config.tipo === 'number') {
          return (
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={config.valor}
              onChange={(e) => {
                const newConfig = { ...editingConfig, valor: e.target.value };
                setEditingConfig(newConfig);
              }}
            />
          );
        } else {
          return (
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={config.valor}
              onChange={(e) => {
                const newConfig = { ...editingConfig, valor: e.target.value };
                setEditingConfig(newConfig);
              }}
            />
          );
        }
      };

      return (
        <div className="space-y-3">
          {renderInput()}
          <div className="flex gap-2">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              onClick={async () => {
                // Confirmación antes de guardar
                const result = await Swal.fire({
                  title: '¿Confirmar cambio?',
                  html: `
                    <div class="text-left">
                      <p><strong>Configuración:</strong> ${config.clave}</p>
                      <p><strong>Valor actual:</strong> ${config.valor}</p>
                      <p><strong>Nuevo valor:</strong> ${editingConfig.valor}</p>
                    </div>
                  `,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, guardar',
                  cancelButtonText: 'Cancelar',
                  confirmButtonColor: '#059669',
                  cancelButtonColor: '#6b7280'
                });

                if (result.isConfirmed) {
                  updateConfiguracion(config.clave, editingConfig.valor);
                }
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Guardar
            </button>
            <button
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              onClick={() => setEditingConfig(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    const getDisplayValue = () => {
      if (config.tipo === 'boolean') {
        return config.valor === 'true' ? 
          <span className="flex items-center gap-2 text-green-600"><span>✅</span> Habilitado</span> : 
          <span className="flex items-center gap-2 text-red-600"><span>❌</span> Deshabilitado</span>;
      }
      return <span className="text-xl font-bold text-gray-900">{config.valor}</span>;
    };

    return (
      <button 
        className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" 
        onClick={() => setEditingConfig(config)}
        title="Hacer clic para editar este valor"
      >
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-blue-200">
          <div className="flex-1">
            {getDisplayValue()}
          </div>
          <div className="opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium hidden group-hover:block">
              Editar
            </span>
            <div className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </button>
    );
  };

  const formatCategoria = (categoria: string) => {
    return categoria
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'string': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-purple-100 text-purple-800';
      case 'json': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'politicas_solicitud': return '📋';
      case 'limites_sistema': return '⚡';
      case 'flujo_aprobacion': return '✅';
      default: return '⚙️';
    }
  };

  const getCategoryDescription = (categoria: string) => {
    switch (categoria) {
      case 'politicas_solicitud': return 'Reglas y políticas para solicitar vacaciones';
      case 'limites_sistema': return 'Límites técnicos y restricciones del sistema';
      case 'flujo_aprobacion': return 'Configuración del proceso de aprobación';
      default: return 'Configuraciones generales del sistema';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⚙️ Configuración del Sistema</h2>
              <p className="text-gray-600 mt-1">Cargando configuraciones...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando configuraciones del sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Panel de Configuración
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Administra las políticas y parámetros del sistema de vacaciones de forma intuitiva
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{configuraciones.length}</div>
              <div className="text-sm text-gray-500">Configuraciones</div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{categorias.length}</div>
              <div className="text-sm text-gray-500">Categorías</div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-green-600">Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error de conexión</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <select 
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">🔍 Mostrar todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.categoria} value={cat.categoria}>
                  {formatCategoria(cat.categoria)} ({cat.total_configuraciones})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          {categoriaSeleccionada && (
            <button
              onClick={() => setCategoriaSeleccionada('')}
              className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕ Limpiar filtro
            </button>
          )}
        </div>

        {/* Content Area */}
        {configuraciones.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sin configuraciones</h3>
            <p className="text-gray-500 text-lg">
              {categoriaSeleccionada 
                ? `No hay configuraciones en "${formatCategoria(categoriaSeleccionada)}"`
                : 'No se encontraron configuraciones en el sistema'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Category Overview Cards */}
            {!categoriaSeleccionada && categorias.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  📊 Categorías de Configuración
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorias.map((cat) => (
                    <button
                      key={cat.categoria}
                      onClick={() => setCategoriaSeleccionada(cat.categoria)}
                      className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-blue-300 p-6 text-left focus:outline-none focus:ring-4 focus:ring-blue-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-white text-lg font-bold">
                            {getCategoryIcon(cat.categoria)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                            Hacer clic para ver
                          </span>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                        {formatCategoria(cat.categoria)}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-700 transition-colors">
                        {getCategoryDescription(cat.categoria)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                          {cat.total_configuraciones}
                        </span>
                        <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                          configuraciones
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Configuration Cards */}
            <div className="space-y-6">
              {categoriaSeleccionada && (
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCategoria(categoriaSeleccionada)}
                  </h2>
                  <p className="text-gray-600">
                    {configuraciones.length} configuraciones en esta categoría
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {configuraciones.map((config) => (
                  <div
                    key={config.id}
                    className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border ${
                      config.es_editable 
                        ? 'border-green-200 hover:border-green-300' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="p-6">
                      {/* Config Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 font-mono">
                              {config.clave}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(config.tipo)}`}>
                              {config.tipo}
                            </span>
                          </div>
                          {config.descripcion && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {config.descripcion}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            config.es_editable 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {config.es_editable ? '✏️ Editable' : '🔒 Bloqueado'}
                          </span>
                        </div>
                      </div>

                      {/* Config Value */}
                      <div className={`rounded-xl p-4 mb-4 ${
                        config.es_editable 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Valor Actual
                            {config.es_editable && (
                              <span className="ml-2 text-green-600 text-xs">
                                👆 Hacer clic para editar
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(config.fecha_actualizacion).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className={config.es_editable ? 'cursor-pointer' : ''}>
                          {renderValueEditor(config)}
                        </div>
                      </div>

                      {/* Config Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                          📂 {formatCategoria(config.categoria)}
                        </span>
                        <span>
                          ID: {config.id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfigurationManager;