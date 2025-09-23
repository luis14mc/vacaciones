import React, { useState } from 'react';

interface Department {
  id: number;
  nombre: string;
  supervisor_id?: number;
  supervisor_nombre?: string;
  empleados_count: number;
  activo: boolean;
}

interface VacationPolicy {
  id: number;
  nombre: string;
  anos_minimos: number;
  anos_maximos: number;
  dias_vacaciones: number;
  activo: boolean;
}

interface SystemSetting {
  key: string;
  nombre: string;
  valor: string;
  tipo: 'text' | 'number' | 'boolean' | 'select';
  opciones?: string[];
  descripcion: string;
}

interface ApprovalWorkflow {
  id: number;
  nombre: string;
  departamento_id?: number;
  departamento_nombre?: string;
  nivel_1: string;
  nivel_2?: string;
  nivel_3?: string;
  dias_limite: number;
  activo: boolean;
}

const ConfigurationPanel: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, nombre: 'RRHH', supervisor_id: 1, supervisor_nombre: 'Yolanda García', empleados_count: 3, activo: true },
    { id: 2, nombre: 'Ingeniería', supervisor_id: 2, supervisor_nombre: 'Carlos López', empleados_count: 8, activo: true },
    { id: 3, nombre: 'Ventas', supervisor_id: 3, supervisor_nombre: 'Ana Martínez', empleados_count: 5, activo: true },
    { id: 4, nombre: 'Marketing', empleados_count: 0, activo: false }
  ]);

  const [vacationPolicies, setVacationPolicies] = useState<VacationPolicy[]>([
    { id: 1, nombre: 'Empleados Nuevos', anos_minimos: 0, anos_maximos: 0, dias_vacaciones: 15, activo: true },
    { id: 2, nombre: 'Empleados 1-2 años', anos_minimos: 1, anos_maximos: 2, dias_vacaciones: 20, activo: true },
    { id: 3, nombre: 'Empleados 3-4 años', anos_minimos: 3, anos_maximos: 4, dias_vacaciones: 25, activo: true },
    { id: 4, nombre: 'Empleados 5+ años', anos_minimos: 5, anos_maximos: 999, dias_vacaciones: 30, activo: true }
  ]);

  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([
    {
      key: 'max_dias_consecutivos',
      nombre: 'Máximo días consecutivos',
      valor: '15',
      tipo: 'number',
      descripcion: 'Número máximo de días consecutivos de vacaciones permitidos'
    },
    {
      key: 'dias_anticipacion_minima',
      nombre: 'Días de anticipación mínima',
      valor: '7',
      tipo: 'number',
      descripcion: 'Días mínimos de anticipación para solicitar vacaciones'
    },
    {
      key: 'permitir_solicitudes_pasadas',
      nombre: 'Permitir solicitudes con fechas pasadas',
      valor: 'false',
      tipo: 'boolean',
      descripcion: 'Permitir que los empleados soliciten vacaciones con fechas ya pasadas'
    },
    {
      key: 'notificaciones_email',
      nombre: 'Notificaciones por email',
      valor: 'true',
      tipo: 'boolean',
      descripcion: 'Enviar notificaciones por email para solicitudes y aprobaciones'
    },
    {
      key: 'año_fiscal_inicio',
      nombre: 'Inicio del año fiscal',
      valor: 'enero',
      tipo: 'select',
      opciones: ['enero', 'abril', 'julio', 'octubre'],
      descripcion: 'Mes de inicio del año fiscal para el cálculo de vacaciones'
    },
    {
      key: 'formato_fecha',
      nombre: 'Formato de fecha',
      valor: 'dd/mm/yyyy',
      tipo: 'select',
      opciones: ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'],
      descripcion: 'Formato de fecha utilizado en el sistema'
    }
  ]);

  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: 1,
      nombre: 'Flujo RRHH',
      departamento_id: 1,
      departamento_nombre: 'RRHH',
      nivel_1: 'Supervisor Directo',
      nivel_2: 'Director RRHH',
      dias_limite: 3,
      activo: true
    },
    {
      id: 2,
      nombre: 'Flujo Ingeniería',
      departamento_id: 2,
      departamento_nombre: 'Ingeniería',
      nivel_1: 'Jefe de Proyecto',
      nivel_2: 'Director Técnico',
      nivel_3: 'Gerencia General',
      dias_limite: 5,
      activo: true
    },
    {
      id: 3,
      nombre: 'Flujo Ventas',
      departamento_id: 3,
      departamento_nombre: 'Ventas',
      nivel_1: 'Supervisor Ventas',
      nivel_2: 'Director Comercial',
      dias_limite: 2,
      activo: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'departments' | 'policies' | 'settings' | 'workflows'>('departments');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Department Modal Form
  const [departmentForm, setDepartmentForm] = useState({
    nombre: '',
    supervisor_id: '',
    activo: true
  });

  // Policy Modal Form
  const [policyForm, setPolicyForm] = useState({
    nombre: '',
    anos_minimos: 0,
    anos_maximos: 0,
    dias_vacaciones: 0,
    activo: true
  });

  // Workflow Modal Form
  const [workflowForm, setWorkflowForm] = useState({
    nombre: '',
    departamento_id: '',
    nivel_1: '',
    nivel_2: '',
    nivel_3: '',
    dias_limite: 3,
    activo: true
  });

  const handleOpenModal = (type: string, item?: any) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'department') {
      setDepartmentForm(item ? {
        nombre: item.nombre,
        supervisor_id: item.supervisor_id?.toString() || '',
        activo: item.activo
      } : {
        nombre: '',
        supervisor_id: '',
        activo: true
      });
    } else if (type === 'policy') {
      setPolicyForm(item ? {
        nombre: item.nombre,
        anos_minimos: item.anos_minimos,
        anos_maximos: item.anos_maximos,
        dias_vacaciones: item.dias_vacaciones,
        activo: item.activo
      } : {
        nombre: '',
        anos_minimos: 0,
        anos_maximos: 0,
        dias_vacaciones: 0,
        activo: true
      });
    } else if (type === 'workflow') {
      setWorkflowForm(item ? {
        nombre: item.nombre,
        departamento_id: item.departamento_id?.toString() || '',
        nivel_1: item.nivel_1,
        nivel_2: item.nivel_2 || '',
        nivel_3: item.nivel_3 || '',
        dias_limite: item.dias_limite,
        activo: item.activo
      } : {
        nombre: '',
        departamento_id: '',
        nivel_1: '',
        nivel_2: '',
        nivel_3: '',
        dias_limite: 3,
        activo: true
      });
    }
    
    setShowModal(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setDepartments(departments.map(dept => 
        dept.id === editingItem.id 
          ? {
              ...dept,
              nombre: departmentForm.nombre,
              supervisor_id: departmentForm.supervisor_id ? parseInt(departmentForm.supervisor_id) : undefined,
              activo: departmentForm.activo
            }
          : dept
      ));
    } else {
      const newDept: Department = {
        id: Math.max(...departments.map(d => d.id), 0) + 1,
        nombre: departmentForm.nombre,
        supervisor_id: departmentForm.supervisor_id ? parseInt(departmentForm.supervisor_id) : undefined,
        empleados_count: 0,
        activo: departmentForm.activo
      };
      setDepartments([...departments, newDept]);
    }
    
    setShowModal(false);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setVacationPolicies(vacationPolicies.map(policy => 
        policy.id === editingItem.id ? { ...policy, ...policyForm } : policy
      ));
    } else {
      const newPolicy: VacationPolicy = {
        id: Math.max(...vacationPolicies.map(p => p.id), 0) + 1,
        ...policyForm
      };
      setVacationPolicies([...vacationPolicies, newPolicy]);
    }
    
    setShowModal(false);
  };

  const handleSaveWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    
    const departamento = departments.find(d => d.id === parseInt(workflowForm.departamento_id));
    
    if (editingItem) {
      setApprovalWorkflows(approvalWorkflows.map(workflow => 
        workflow.id === editingItem.id 
          ? {
              ...workflow,
              ...workflowForm,
              departamento_id: parseInt(workflowForm.departamento_id),
              departamento_nombre: departamento?.nombre
            }
          : workflow
      ));
    } else {
      const newWorkflow: ApprovalWorkflow = {
        id: Math.max(...approvalWorkflows.map(w => w.id), 0) + 1,
        ...workflowForm,
        departamento_id: parseInt(workflowForm.departamento_id),
        departamento_nombre: departamento?.nombre
      };
      setApprovalWorkflows([...approvalWorkflows, newWorkflow]);
    }
    
    setShowModal(false);
  };

  const handleDeleteItem = (type: string, id: number) => {
    if (confirm('¿Está seguro de eliminar este elemento?')) {
      switch (type) {
        case 'department':
          setDepartments(departments.filter(d => d.id !== id));
          break;
        case 'policy':
          setVacationPolicies(vacationPolicies.filter(p => p.id !== id));
          break;
        case 'workflow':
          setApprovalWorkflows(approvalWorkflows.filter(w => w.id !== id));
          break;
      }
    }
  };

  const updateSystemSetting = (key: string, valor: string) => {
    setSystemSettings(systemSettings.map(setting => 
      setting.key === key ? { ...setting, valor } : setting
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel de Configuración</h2>
          <p className="text-gray-600">Administrar configuraciones del sistema de vacaciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('departments')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'departments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Departamentos
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Políticas de Vacaciones
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Flujos de Aprobación
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configuraciones Generales
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'departments' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Departamentos</h3>
                <p className="text-sm text-gray-600">Gestionar departamentos y supervisores</p>
              </div>
              <button
                onClick={() => handleOpenModal('department')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Agregar Departamento
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.supervisor_nombre || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.empleados_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          dept.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dept.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal('department', dept)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem('department', dept.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Políticas de Vacaciones</h3>
                <p className="text-sm text-gray-600">Configurar días de vacaciones según antigüedad</p>
              </div>
              <button
                onClick={() => handleOpenModal('policy')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Agregar Política
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rango de Años</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días de Vacaciones</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vacationPolicies.map((policy) => (
                    <tr key={policy.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policy.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {policy.anos_minimos === policy.anos_maximos 
                          ? `${policy.anos_minimos} año${policy.anos_minimos !== 1 ? 's' : ''}`
                          : `${policy.anos_minimos} - ${policy.anos_maximos === 999 ? '∞' : policy.anos_maximos} años`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policy.dias_vacaciones} días</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          policy.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {policy.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal('policy', policy)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem('policy', policy.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Flujos de Aprobación</h3>
                <p className="text-sm text-gray-600">Configurar procesos de aprobación por departamento</p>
              </div>
              <button
                onClick={() => handleOpenModal('workflow')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Agregar Flujo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveles de Aprobación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Límite</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvalWorkflows.map((workflow) => (
                    <tr key={workflow.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workflow.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.departamento_nombre || 'General'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          <div>1. {workflow.nivel_1}</div>
                          {workflow.nivel_2 && <div>2. {workflow.nivel_2}</div>}
                          {workflow.nivel_3 && <div>3. {workflow.nivel_3}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workflow.dias_limite} días</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          workflow.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {workflow.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal('workflow', workflow)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteItem('workflow', workflow.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuraciones Generales</h3>
              <p className="text-sm text-gray-600">Ajustar parámetros globales del sistema</p>
            </div>
            <div className="space-y-6">
              {systemSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">{setting.nombre}</label>
                    <p className="text-sm text-gray-500">{setting.descripcion}</p>
                  </div>
                  <div className="ml-4">
                    {setting.tipo === 'boolean' ? (
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={setting.valor === 'true'}
                          onChange={(e) => updateSystemSetting(setting.key, e.target.checked.toString())}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {setting.valor === 'true' ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                      </label>
                    ) : setting.tipo === 'select' ? (
                      <select
                        value={setting.valor}
                        onChange={(e) => updateSystemSetting(setting.key, e.target.value)}
                        className="mt-1 block w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {setting.opciones?.map((opcion) => (
                          <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={setting.tipo}
                        value={setting.valor}
                        onChange={(e) => updateSystemSetting(setting.key, e.target.value)}
                        className="mt-1 block w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Editar' : 'Agregar'} {
                  modalType === 'department' ? 'Departamento' :
                  modalType === 'policy' ? 'Política' : 'Flujo de Aprobación'
                }
              </h3>

              {modalType === 'department' && (
                <form onSubmit={handleSaveDepartment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Departamento</label>
                    <input
                      type="text"
                      required
                      value={departmentForm.nombre}
                      onChange={(e) => setDepartmentForm({...departmentForm, nombre: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                    <select
                      value={departmentForm.supervisor_id}
                      onChange={(e) => setDepartmentForm({...departmentForm, supervisor_id: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sin supervisor asignado</option>
                      <option value="1">Yolanda García</option>
                      <option value="2">Carlos López</option>
                      <option value="3">Ana Martínez</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={departmentForm.activo}
                      onChange={(e) => setDepartmentForm({...departmentForm, activo: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Departamento activo</label>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'policy' && (
                <form onSubmit={handleSavePolicy} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Política</label>
                    <input
                      type="text"
                      required
                      value={policyForm.nombre}
                      onChange={(e) => setPolicyForm({...policyForm, nombre: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Años Mínimos</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={policyForm.anos_minimos}
                        onChange={(e) => setPolicyForm({...policyForm, anos_minimos: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Años Máximos</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={policyForm.anos_maximos}
                        onChange={(e) => setPolicyForm({...policyForm, anos_maximos: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Días de Vacaciones</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={policyForm.dias_vacaciones}
                      onChange={(e) => setPolicyForm({...policyForm, dias_vacaciones: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={policyForm.activo}
                      onChange={(e) => setPolicyForm({...policyForm, activo: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Política activa</label>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'workflow' && (
                <form onSubmit={handleSaveWorkflow} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Flujo</label>
                    <input
                      type="text"
                      required
                      value={workflowForm.nombre}
                      onChange={(e) => setWorkflowForm({...workflowForm, nombre: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Departamento</label>
                    <select
                      required
                      value={workflowForm.departamento_id}
                      onChange={(e) => setWorkflowForm({...workflowForm, departamento_id: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar departamento</option>
                      {departments.filter(d => d.activo).map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel 1 de Aprobación</label>
                    <input
                      type="text"
                      required
                      value={workflowForm.nivel_1}
                      onChange={(e) => setWorkflowForm({...workflowForm, nivel_1: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel 2 de Aprobación (Opcional)</label>
                    <input
                      type="text"
                      value={workflowForm.nivel_2}
                      onChange={(e) => setWorkflowForm({...workflowForm, nivel_2: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel 3 de Aprobación (Opcional)</label>
                    <input
                      type="text"
                      value={workflowForm.nivel_3}
                      onChange={(e) => setWorkflowForm({...workflowForm, nivel_3: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Días Límite para Aprobación</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={workflowForm.dias_limite}
                      onChange={(e) => setWorkflowForm({...workflowForm, dias_limite: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={workflowForm.activo}
                      onChange={(e) => setWorkflowForm({...workflowForm, activo: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Flujo activo</label>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;