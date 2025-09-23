import React, { useState, useEffect } from 'react';
import { userService } from '../../lib/services/users';
import { SweetAlert } from '../../lib/utils/sweetAlert';
import type { User, UserFormData, UserRole } from '../../types';

const UserCRUD: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [potentialSupervisors, setPotentialSupervisors] = useState<User[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellido: '',
    email: '',
    numeroEmpleado: '',
    telefono: '',
    fechaContratacion: '',
    rol: 'empleado',
    jefeSuperiorId: undefined,
    diasDisponibles: 30,
    password: ''
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
    loadPotentialSupervisors();
  }, []);

  // Cargar todos los usuarios
  const loadUsers = async () => {
    try {
      console.log('=== UserCRUD loadUsers START ===');
      console.log('Auth token in localStorage:', localStorage.getItem('auth_token'));
      setLoading(true);
      const response = await userService.getAllUsers({
        search: searchTerm,
        limit: 100
      });
      
      console.log('loadUsers response:', response);
      
      if (response.success && response.data) {
        setUsers(response.data);
        console.log('Users loaded successfully:', response.data.length, 'users');
      } else {
        console.error('loadUsers failed:', response);
        await SweetAlert.error('Error al cargar usuarios', response.message || 'Error al cargar usuarios');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      await SweetAlert.error('Error inesperado', error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
      console.log('=== UserCRUD loadUsers END ===');
    }
  };

  // Cargar supervisores potenciales
  const loadPotentialSupervisors = async () => {
    try {
      console.log('=== UserCRUD loadPotentialSupervisors START ===');
      console.log('Auth token in localStorage:', localStorage.getItem('auth_token'));
      const response = await userService.getPotentialManagers();
      console.log('loadPotentialSupervisors response:', response);
      if (response.success && response.data) {
        setPotentialSupervisors(response.data);
        console.log('Potential supervisors loaded:', response.data.length, 'supervisors');
      }
    } catch (error: any) {
      console.error('Error loading potential supervisors:', error);
    } finally {
      console.log('=== UserCRUD loadPotentialSupervisors END ===');
    }
  };

  // Buscar usuarios
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== '') {
        loadUsers();
      } else {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Abrir modal para crear/editar usuario
  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        numeroEmpleado: user.numeroEmpleado,
        telefono: user.telefono || '',
        fechaContratacion: user.fechaContratacion ? user.fechaContratacion.split('T')[0] : '', // Formato YYYY-MM-DD
        rol: user.rol,
        jefeSuperiorId: user.jefeSuperiorId,
        diasDisponibles: user.diasDisponibles,
        password: '' // No mostrar password existente
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        numeroEmpleado: '',
        telefono: '',
        fechaContratacion: '',
        rol: 'empleado',
        jefeSuperiorId: undefined,
        diasDisponibles: 30,
        password: ''
      });
    }
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'diasDisponibles' ? parseInt(value) || 0 : 
               name === 'jefeSuperiorId' && value === '' ? undefined : 
               name === 'jefeSuperiorId' ? parseInt(value) : value
    }));
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      SweetAlert.loading('Guardando usuario...');

      if (editingUser) {
        // Actualizar usuario existente
        const { password, ...updateData } = formData;
        const response = await userService.updateUser(editingUser.id, updateData);
        
        SweetAlert.close();
        
        if (response.success) {
          await SweetAlert.success('¡Usuario actualizado!', 'El usuario ha sido actualizado correctamente');
          await loadUsers();
          handleCloseModal();
        } else {
          await SweetAlert.error('Error al actualizar', response.message || 'Error al actualizar usuario');
        }
      } else {
        // Crear nuevo usuario
        if (!formData.password) {
          SweetAlert.close();
          await SweetAlert.error('Contraseña requerida', 'La contraseña es requerida para nuevos usuarios');
          return;
        }
        
        const response = await userService.createUser(formData);
        
        SweetAlert.close();
        
        if (response.success) {
          await SweetAlert.success('¡Usuario creado!', 'El usuario ha sido creado correctamente');
          await loadUsers();
          handleCloseModal();
        } else {
          await SweetAlert.error('Error al crear usuario', response.message || 'Error al crear usuario');
        }
      }
    } catch (error: any) {
      SweetAlert.close();
      await SweetAlert.error('Error inesperado', error.message || 'Error al guardar usuario');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (user: User) => {
    const result = await SweetAlert.confirmDelete(
      `¿Eliminar usuario?`,
      `¿Está seguro de que desea eliminar al usuario ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer.`
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      SweetAlert.loading('Eliminando usuario...');
      const response = await userService.deleteUser(user.id);
      
      SweetAlert.close();
      
      if (response.success) {
        await SweetAlert.success('¡Usuario eliminado!', 'El usuario ha sido eliminado correctamente');
        await loadUsers();
      } else {
        await SweetAlert.error('Error al eliminar', response.message || 'Error al eliminar usuario');
      }
    } catch (error: any) {
      SweetAlert.close();
      await SweetAlert.error('Error inesperado', error.message || 'Error al eliminar usuario');
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleUserStatus = async (user: User) => {
    const action = user.activo ? 'desactivar' : 'activar';
    const result = await SweetAlert.confirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      `¿Está seguro de que desea ${action} al usuario ${user.nombre} ${user.apellido}?`,
      action.charAt(0).toUpperCase() + action.slice(1),
      'Cancelar'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      SweetAlert.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ando usuario...`);
      const response = await userService.toggleUserStatus(user.id, !user.activo);
      
      SweetAlert.close();
      
      if (response.success) {
        await SweetAlert.success(
          `¡Usuario ${action}!`, 
          `El usuario ha sido ${action}do correctamente`
        );
        await loadUsers();
      } else {
        await SweetAlert.error(`Error al ${action}`, response.message || `Error al ${action} usuario`);
      }
    } catch (error: any) {
      SweetAlert.close();
      await SweetAlert.error('Error inesperado', error.message || `Error al ${action} usuario`);
    }
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.numeroEmpleado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener nombre del rol en español
  const getRoleName = (rol: UserRole) => {
    switch (rol) {
      case 'rrhh': return 'RRHH';
      case 'jefe_superior': return 'Jefe Superior';
      case 'empleado': return 'Empleado';
      default: return rol;
    }
  };

  // Obtener color del badge del rol
  const getRoleColor = (rol: UserRole) => {
    switch (rol) {
      case 'rrhh': return 'bg-red-100 text-red-800';
      case 'jefe_superior': return 'bg-blue-100 text-blue-800';
      case 'empleado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 group"
          disabled={loading}
        >
          <svg 
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email o número de empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 group"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días Disponibles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-1">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
                      />
                    </svg>
                    <span>Acciones</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.numeroEmpleado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                        {getRoleName(user.rol)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.diasDisponibles}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Botón Editar */}
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-all duration-200 group"
                          title="Editar usuario"
                        >
                          <svg 
                            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                            />
                          </svg>
                        </button>

                        {/* Botón Activar/Desactivar */}
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`p-2 rounded-full transition-all duration-200 group ${
                            user.activo 
                              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {user.activo ? (
                            // Icono para desactivar - power off
                            <svg 
                              className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M18.364 5.636L5.636 18.364m0-12.728L18.364 18.364" 
                              />
                            </svg>
                          ) : (
                            // Icono para activar - check mark
                            <svg 
                              className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          )}
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-all duration-200 group"
                          title="Eliminar usuario"
                        >
                          <svg 
                            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="numeroEmpleado" className="block text-sm font-medium text-gray-700">Número de Empleado</label>
                    <input
                      type="text"
                      id="numeroEmpleado"
                      name="numeroEmpleado"
                      value={formData.numeroEmpleado}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="empleado">Empleado</option>
                    <option value="jefe_superior">Jefe Superior</option>
                    <option value="rrhh">RRHH</option>
                  </select>
                </div>

                {formData.rol === 'empleado' && (
                  <div>
                    <label htmlFor="jefeSuperiorId" className="block text-sm font-medium text-gray-700">Jefe Superior</label>
                    <select
                      id="jefeSuperiorId"
                      name="jefeSuperiorId"
                      value={formData.jefeSuperiorId || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar Jefe Superior</option>
                      {potentialSupervisors.map(supervisor => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.nombre} {supervisor.apellido} - {getRoleName(supervisor.rol)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="diasDisponibles" className="block text-sm font-medium text-gray-700">Días de Vacaciones</label>
                    <input
                      type="number"
                      id="diasDisponibles"
                      name="diasDisponibles"
                      value={formData.diasDisponibles}
                      onChange={handleInputChange}
                      min="0"
                      max="365"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fechaContratacion" className="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                    <input
                      type="date"
                      id="fechaContratacion"
                      name="fechaContratacion"
                      value={formData.fechaContratacion}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                      minLength={6}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCRUD;