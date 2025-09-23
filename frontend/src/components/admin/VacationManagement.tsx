import React, { useState } from 'react';

interface VacationBalance {
  id: number;
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  departamento: string;
  dias_disponibles: number;
  dias_tomados: number;
  dias_pendientes: number;
  ultimo_ajuste: string;
  motivo_ajuste?: string;
}

interface AdjustmentHistory {
  id: number;
  usuario_id: number;
  tipo: 'incremento' | 'decremento' | 'reset';
  cantidad: number;
  motivo: string;
  fecha: string;
  realizado_por: string;
}

const VacationManagement: React.FC = () => {
  const [balances, setBalances] = useState<VacationBalance[]>([
    {
      id: 1,
      usuario_id: 1,
      nombre: 'Yolanda',
      apellido: 'García',
      email: 'ygarcia@cni.hn',
      departamento: 'RRHH',
      dias_disponibles: 30,
      dias_tomados: 5,
      dias_pendientes: 2,
      ultimo_ajuste: '2024-01-01'
    },
    {
      id: 2,
      usuario_id: 2,
      nombre: 'Carlos',
      apellido: 'López',
      email: 'carlos.lopez@cni.hn',
      departamento: 'Ingeniería',
      dias_disponibles: 25,
      dias_tomados: 8,
      dias_pendientes: 1,
      ultimo_ajuste: '2024-01-01'
    },
    {
      id: 3,
      usuario_id: 3,
      nombre: 'Ana',
      apellido: 'Martínez',
      email: 'ana.martinez@cni.hn',
      departamento: 'Ingeniería',
      dias_disponibles: 20,
      dias_tomados: 3,
      dias_pendientes: 0,
      ultimo_ajuste: '2024-01-01'
    }
  ]);

  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentHistory[]>([
    {
      id: 1,
      usuario_id: 1,
      tipo: 'incremento',
      cantidad: 5,
      motivo: 'Bonificación por antigüedad',
      fecha: '2024-01-15',
      realizado_por: 'Yolanda García'
    }
  ]);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VacationBalance | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    tipo: 'incremento' as 'incremento' | 'decremento' | 'reset',
    cantidad: 0,
    motivo: ''
  });

  const handleOpenAdjustModal = (user: VacationBalance) => {
    setSelectedUser(user);
    setAdjustmentForm({
      tipo: 'incremento',
      cantidad: 0,
      motivo: ''
    });
    setShowAdjustModal(true);
  };

  const handleAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    let newDiasDisponibles = selectedUser.dias_disponibles;
    
    switch (adjustmentForm.tipo) {
      case 'incremento':
        newDiasDisponibles += adjustmentForm.cantidad;
        break;
      case 'decremento':
        newDiasDisponibles = Math.max(0, newDiasDisponibles - adjustmentForm.cantidad);
        break;
      case 'reset':
        newDiasDisponibles = adjustmentForm.cantidad;
        break;
    }

    // Actualizar balance
    setBalances(balances.map(balance => 
      balance.id === selectedUser.id 
        ? {
            ...balance,
            dias_disponibles: newDiasDisponibles,
            ultimo_ajuste: new Date().toISOString().split('T')[0],
            motivo_ajuste: adjustmentForm.motivo
          }
        : balance
    ));

    // Agregar al historial
    const newHistoryEntry: AdjustmentHistory = {
      id: Math.max(...adjustmentHistory.map(h => h.id), 0) + 1,
      usuario_id: selectedUser.usuario_id,
      tipo: adjustmentForm.tipo,
      cantidad: adjustmentForm.cantidad,
      motivo: adjustmentForm.motivo,
      fecha: new Date().toISOString().split('T')[0],
      realizado_por: 'Admin' // En producción sería el usuario actual
    };

    setAdjustmentHistory([...adjustmentHistory, newHistoryEntry]);
    setShowAdjustModal(false);
  };

  const handleBulkAdjustment = () => {
    if (confirm('¿Está seguro de aplicar el ajuste anual a todos los empleados?')) {
      const currentYear = new Date().getFullYear();
      setBalances(balances.map(balance => ({
        ...balance,
        dias_disponibles: getDiasVacacionesPorAntiguedad(currentYear - 2020), // Ejemplo de cálculo
        dias_tomados: 0, // Reset al inicio del año
        ultimo_ajuste: new Date().toISOString().split('T')[0],
        motivo_ajuste: 'Ajuste anual automático'
      })));
    }
  };

  const getDiasVacacionesPorAntiguedad = (anosAntiguedad: number): number => {
    if (anosAntiguedad < 1) return 15;
    if (anosAntiguedad < 3) return 20;
    if (anosAntiguedad < 5) return 25;
    return 30;
  };

  const getTotalDias = () => {
    return balances.reduce((total, balance) => total + balance.dias_disponibles, 0);
  };

  const getTotalUsados = () => {
    return balances.reduce((total, balance) => total + balance.dias_tomados, 0);
  };

  const getTotalPendientes = () => {
    return balances.reduce((total, balance) => total + balance.dias_pendientes, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Días de Vacaciones</h2>
          <p className="text-gray-600">Administrar balances y asignaciones de vacaciones</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Historial
          </button>
          <button
            onClick={handleBulkAdjustment}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Ajuste Anual
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTotalDias()}</p>
              <p className="text-sm text-gray-600">Total Días Disponibles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTotalUsados()}</p>
              <p className="text-sm text-gray-600">Días Utilizados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTotalPendientes()}</p>
              <p className="text-sm text-gray-600">Solicitudes Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(getTotalDias() / balances.length)}</p>
              <p className="text-sm text-gray-600">Promedio por Empleado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Balance de Vacaciones por Empleado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendientes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Ajuste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {balances.map((balance) => (
                <tr key={balance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {balance.nombre.charAt(0)}{balance.apellido.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{balance.nombre} {balance.apellido}</div>
                        <div className="text-sm text-gray-500">{balance.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{balance.departamento}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-green-600">{balance.dias_disponibles}</span>
                    <span className="text-sm text-gray-500 ml-1">días</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-red-600">{balance.dias_tomados}</span>
                    <span className="text-sm text-gray-500 ml-1">días</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-semibold ${balance.dias_pendientes > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {balance.dias_pendientes}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">días</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(balance.ultimo_ajuste).toLocaleDateString()}
                    {balance.motivo_ajuste && (
                      <div className="text-xs text-gray-500">{balance.motivo_ajuste}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenAdjustModal(balance)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ajustar Días de Vacaciones
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Empleado: <strong>{selectedUser.nombre} {selectedUser.apellido}</strong><br/>
                Días actuales: <strong>{selectedUser.dias_disponibles}</strong>
              </p>
              
              <form onSubmit={handleAdjustment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Ajuste</label>
                  <select
                    value={adjustmentForm.tipo}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, tipo: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="incremento">Incrementar días</option>
                    <option value="decremento">Decrementar días</option>
                    <option value="reset">Establecer cantidad exacta</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {adjustmentForm.tipo === 'reset' ? 'Nueva cantidad' : 'Cantidad de días'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={adjustmentForm.cantidad}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, cantidad: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo</label>
                  <textarea
                    required
                    value={adjustmentForm.motivo}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, motivo: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descripción del motivo del ajuste..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Aplicar Ajuste
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Historial de Ajustes
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realizado por</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adjustmentHistory.map((history) => {
                      const user = balances.find(b => b.usuario_id === history.usuario_id);
                      return (
                        <tr key={history.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(history.fecha).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user ? `${user.nombre} ${user.apellido}` : 'Usuario eliminado'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              history.tipo === 'incremento' ? 'bg-green-100 text-green-800' :
                              history.tipo === 'decremento' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {history.tipo === 'incremento' ? 'Incremento' :
                               history.tipo === 'decremento' ? 'Decremento' : 'Reset'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {history.cantidad} días
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{history.motivo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{history.realizado_por}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationManagement;