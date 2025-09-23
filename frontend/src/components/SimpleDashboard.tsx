import React, { useState, useEffect } from 'react';
import UserCRUD from './admin/UserCRUD';
import VacationManagement from './admin/VacationManagement';
import VacationRequestsCRUD from './admin/VacationRequestsCRUD';
import ReportsSystem from './admin/ReportsSystem';
import ConfigurationPanel from './admin/ConfigurationPanel';

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  departamento?: string;
  dias_disponibles?: number;
}

const SimpleDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAdminView, setActiveAdminView] = useState<'overview' | 'users' | 'vacation-requests' | 'vacation-days' | 'reports' | 'config'>('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Debug: Log when activeAdminView changes
  useEffect(() => {
    console.log('activeAdminView changed to:', activeAdminView);
  }, [activeAdminView]);

  // Función para renderizar el header mejorado
  const renderHeader = (title: string, subtitle: string, showBackButton = false) => (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {/* Logo CNI */}
            <div className="flex items-center">
              <img 
                src="/cni_color.png" 
                alt="CNI Logo" 
                className="h-12 w-auto"
              />
              <div className="ml-4 border-l border-gray-300 pl-4">
                {showBackButton && (
                  <button
                    onClick={() => setActiveAdminView('overview')}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center mb-1"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Volver al Dashboard
                  </button>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">Departamento: {user?.departamento || 'No asignado'}</p>
                  {user?.dias_disponibles && (
                    <p className="text-xs text-blue-600">Días disponibles: {user.dias_disponibles}</p>
                  )}
                </div>
                
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
                  </div>
                </button>

                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Configuraciones
                  </div>
                </button>

                <div className="border-t border-gray-100 mt-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Cerrar Sesión
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('=== LOADING USER FROM TOKEN ===');
        console.log('Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
        
        if (!token) {
          setError('No hay token de autenticación');
          setLoading(false);
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        
        const userData = {
          id: payload.id || payload.userId,
          email: payload.email,
          nombre: payload.nombre || 'Usuario',
          apellido: payload.apellido || 'Apellido',
          rol: payload.rol || 'empleado',
          departamento: 'Desarrollo',
          dias_disponibles: payload.dias_disponibles || 20
        };
        
        console.log('Setting user data:', userData);
        setUser(userData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Error al cargar datos del usuario');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    // Confirmar antes de cerrar sesión
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      console.log('=== LOGOUT START ===');
      console.log('Clearing localStorage...');
      
      // Limpiar todas las claves de autenticación (tanto las viejas como las nuevas)
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('refresh_token');
      // También limpiar las claves viejas por si acaso
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('cni_token');
      
      console.log('LocalStorage cleared');
      console.log('Remaining auth_token:', localStorage.getItem('auth_token'));
      console.log('Remaining user_data:', localStorage.getItem('user_data'));
      
      // Limpiar datos de usuario
      setUser(null);
      
      console.log('=== LOGOUT END - Redirecting to login ===');
      
      // Redireccionar al login
      window.location.replace('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  console.log('Current user:', user);
  console.log('User role:', user.rol);
  console.log('Active admin view:', activeAdminView);

  // Dashboard simple para empleado
  if (user.rol === 'empleado') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader('Mis Vacaciones', 'Panel de empleado')}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards con mejor diseño */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium opacity-90">Días Disponibles</h3>
                  <p className="text-3xl font-bold">{user.dias_disponibles}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium opacity-90">Solicitudes Pendientes</h3>
                  <p className="text-3xl font-bold">2</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium opacity-90">Días Usados</h3>
                  <p className="text-3xl font-bold">10</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="group bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 p-6 rounded-xl text-center transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Nueva Solicitud</h4>
                <p className="text-sm text-gray-600">Solicitar días de vacaciones</p>
              </button>

              <button className="group bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 p-6 rounded-xl text-center transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ver Historial</h4>
                <p className="text-sm text-gray-600">Consultar solicitudes anteriores</p>
              </button>

              <button className="group bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300 p-6 rounded-xl text-center transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Calendario</h4>
                <p className="text-sm text-gray-600">Ver calendario de vacaciones</p>
              </button>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Solicitudes Recientes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">5 días de vacaciones</p>
                  <p className="text-sm text-gray-600">15 - 19 Enero 2025</p>
                  <p className="text-xs text-yellow-600 font-medium">Pendiente de aprobación</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Pendiente
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">3 días de vacaciones</p>
                  <p className="text-sm text-gray-600">8 - 10 Diciembre 2024</p>
                  <p className="text-xs text-green-600 font-medium">Aprobado por supervisor</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Aprobado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para RRHH
  console.log('=== AUTH DEBUG ===');
  console.log('localStorage auth_token:', localStorage.getItem('auth_token'));
  console.log('localStorage user_data:', localStorage.getItem('user_data'));
  console.log('==================');
  console.log('Complete user object:', JSON.stringify(user, null, 2));
  console.log('Checking if user role is RRHH. User role:', user.rol, 'Type:', typeof user.rol);
  console.log('Exact comparison results:', {
    'rol === "rrhh"': user.rol === 'rrhh',
    'rol === "RRHH"': user.rol === 'RRHH',
    'rol (trimmed) === "rrhh"': user.rol?.trim() === 'rrhh',
    'rol (trimmed) === "RRHH"': user.rol?.trim() === 'RRHH',
    'rol toLowerCase()': user.rol?.toLowerCase(),
  });
  if (user.rol === 'rrhh' || user.rol === 'RRHH') {
    console.log('User role is RRHH, activeAdminView:', activeAdminView);
    
    if (activeAdminView === 'users') {
      console.log('Rendering UserCRUD component');
      return (
        <div className="min-h-screen bg-gray-50">
          {renderHeader('Gestión de Usuarios', 'Administrar empleados y roles', true)}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <UserCRUD />
          </div>
        </div>
      );
    }

    if (activeAdminView === 'vacation-requests') {
      return (
        <div className="min-h-screen bg-gray-50">
          {renderHeader('Gestión de Solicitudes de Vacaciones', 'Administrar solicitudes y aprobaciones', true)}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <VacationRequestsCRUD />
          </div>
        </div>
      );
    }

    if (activeAdminView === 'vacation-days') {
      return (
        <div className="min-h-screen bg-gray-50">
          {renderHeader('Gestión de Días de Vacaciones', 'Administrar balances y asignaciones', true)}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <VacationManagement />
          </div>
        </div>
      );
    }

    if (activeAdminView === 'reports') {
      return (
        <div className="min-h-screen bg-gray-50">
          {renderHeader('Sistema de Reportes', 'Análisis y estadísticas de vacaciones', true)}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ReportsSystem />
          </div>
        </div>
      );
    }

    if (activeAdminView === 'config') {
      return (
        <div className="min-h-screen bg-gray-50">
          {renderHeader('Panel de Configuración', 'Configuraciones del sistema', true)}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ConfigurationPanel />
          </div>
        </div>
      );
    }

    // Vista de resumen para RRHH
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader('Dashboard Administrativo', 'Panel de RRHH')}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Total Empleados</h3>
                  <p className="text-3xl font-bold">142</p>
                  <p className="text-sm opacity-75">+5 este mes</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Solicitudes Pendientes</h3>
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-sm opacity-75">Requieren atención</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Aprobadas Hoy</h3>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm opacity-75">85% tasa aprobación</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Departamentos</h3>
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-sm opacity-75">Activos</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Menu mejorado */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Administración de Vacaciones</h3>
              <p className="text-gray-600">Gestiona todos los aspectos del sistema de vacaciones de CNI</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => {
                  console.log('Button clicked! Setting activeAdminView to users');
                  setActiveAdminView('users');
                }}
                className="group bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 p-8 rounded-xl text-center transition-all transform hover:scale-105 hover:shadow-lg"
                type="button"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h4>
                <p className="text-gray-600 mb-4">Crear, editar y gestionar empleados</p>
                <div className="text-sm text-blue-600 font-medium">142 empleados activos</div>
              </button>

              <button 
                onClick={() => setActiveAdminView('vacation-requests')}
                className="group bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-300 p-8 rounded-xl text-center transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Solicitudes</h4>
                <p className="text-gray-600 mb-4">Gestionar solicitudes de vacaciones</p>
                <div className="text-sm text-yellow-600 font-medium">12 pendientes</div>
              </button>

              <button 
                onClick={() => setActiveAdminView('vacation-days')}
                className="group bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 p-8 rounded-xl text-center transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Días de Vacaciones</h4>
                <p className="text-gray-600 mb-4">Ajustar balances y asignaciones</p>
                <div className="text-sm text-green-600 font-medium">3,420 días disponibles</div>
              </button>

              <button 
                onClick={() => setActiveAdminView('reports')}
                className="group bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300 p-8 rounded-xl text-center transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Reportes</h4>
                <p className="text-gray-600 mb-4">Análisis y estadísticas</p>
                <div className="text-sm text-purple-600 font-medium">24 reportes disponibles</div>
              </button>

              <button 
                onClick={() => setActiveAdminView('config')}
                className="group bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 p-8 rounded-xl text-center transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Configuración</h4>
                <p className="text-gray-600 mb-4">Configurar sistema y políticas</p>
                <div className="text-sm text-gray-600 font-medium">8 departamentos configurados</div>
              </button>
            </div>
          </div>

          {/* Dashboard grid con información adicional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity mejorada */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver todo
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Carlos López solicitó 5 días de vacaciones</p>
                    <p className="text-xs text-gray-500">15-19 Enero 2025 • Hace 2 horas</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Nuevo
                  </span>
                </div>
                
                <div className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Se aprobó la solicitud de Ana Martínez</p>
                    <p className="text-xs text-gray-500">8-10 Diciembre 2024 • Hace 4 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-400">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Luis Hernández pendiente de aprobación</p>
                    <p className="text-xs text-gray-500">22-26 Enero 2025 • Hace 6 horas</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del Mes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Solicitudes procesadas</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">86</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Tasa de aprobación</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">94%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Días promedio solicitados</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">7.2</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Tiempo promedio respuesta</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">1.8d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para Jefe Superior
  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader('Panel de Aprobaciones', 'Jefe Superior')}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium opacity-90">Pendientes de Aprobar</h3>
                <p className="text-3xl font-bold">8</p>
                <p className="text-sm opacity-75">Requieren tu atención</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium opacity-90">Aprobadas Este Mes</h3>
                <p className="text-3xl font-bold">24</p>
                <p className="text-sm opacity-75">92% tasa aprobación</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium opacity-90">Mi Equipo</h3>
                <p className="text-3xl font-bold">15</p>
                <p className="text-sm opacity-75">Empleados supervisados</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solicitudes Pendientes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Solicitudes Pendientes</h3>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                8 pendientes
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="group p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-lg hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-600">AC</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Ana Castillo</p>
                        <p className="text-xs text-gray-500">Ingeniería</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">5 días de vacaciones</p>
                    <p className="text-xs text-gray-500">1 Feb - 5 Feb 2025</p>
                    <p className="text-xs text-blue-600 mt-1">Motivo: Vacaciones familiares</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                      Aprobar
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 rounded-lg hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-green-600">CL</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Carlos López</p>
                        <p className="text-xs text-gray-500">Ingeniería</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">3 días de vacaciones</p>
                    <p className="text-xs text-gray-500">10 Feb - 12 Feb 2025</p>
                    <p className="text-xs text-blue-600 mt-1">Motivo: Asuntos personales</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                      Aprobar
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver todas las solicitudes pendientes →
                </button>
              </div>
            </div>
          </div>

          {/* Mi Equipo y Estadísticas */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="group bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Ver Historial</h4>
                </button>

                <button className="group bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-green-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Calendario</h4>
                </button>

                <button className="group bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Mi Equipo</h4>
                </button>

                <button className="group bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-300 p-4 rounded-lg text-center transition-all transform hover:scale-105">
                  <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Reportes</h4>
                </button>
              </div>
            </div>

            {/* Team Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Estado del Equipo</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Empleados activos</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">13</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">En vacaciones</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">2</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Promedio días disponibles</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">18.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;