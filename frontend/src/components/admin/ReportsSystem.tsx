import React, { useState } from 'react';

interface ReportData {
  id: number;
  nombre: string;
  apellido: string;
  departamento: string;
  dias_disponibles: number;
  dias_tomados: number;
  dias_pendientes: number;
  ultimo_periodo_tomado?: string;
  promedio_mensual: number;
}

interface DepartmentSummary {
  departamento: string;
  empleados: number;
  total_dias_disponibles: number;
  total_dias_tomados: number;
  total_dias_pendientes: number;
  utilizacion_porcentaje: number;
}

interface VacationTrend {
  mes: string;
  dias_solicitados: number;
  dias_aprobados: number;
  dias_rechazados: number;
}

const ReportsSystem: React.FC = () => {
  const [reportData] = useState<ReportData[]>([
    {
      id: 1,
      nombre: 'Yolanda',
      apellido: 'García',
      departamento: 'RRHH',
      dias_disponibles: 30,
      dias_tomados: 5,
      dias_pendientes: 2,
      ultimo_periodo_tomado: '2024-11-15',
      promedio_mensual: 1.2
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'López',
      departamento: 'Ingeniería',
      dias_disponibles: 25,
      dias_tomados: 8,
      dias_pendientes: 1,
      ultimo_periodo_tomado: '2024-11-01',
      promedio_mensual: 2.1
    },
    {
      id: 3,
      nombre: 'Ana',
      apellido: 'Martínez',
      departamento: 'Ingeniería',
      dias_disponibles: 20,
      dias_tomados: 3,
      dias_pendientes: 0,
      ultimo_periodo_tomado: '2024-10-20',
      promedio_mensual: 0.8
    },
    {
      id: 4,
      nombre: 'Luis',
      apellido: 'Hernández',
      departamento: 'Ventas',
      dias_disponibles: 22,
      dias_tomados: 12,
      dias_pendientes: 3,
      ultimo_periodo_tomado: '2024-12-01',
      promedio_mensual: 3.2
    }
  ]);

  const [departmentSummaries] = useState<DepartmentSummary[]>([
    {
      departamento: 'RRHH',
      empleados: 1,
      total_dias_disponibles: 30,
      total_dias_tomados: 5,
      total_dias_pendientes: 2,
      utilizacion_porcentaje: 16.7
    },
    {
      departamento: 'Ingeniería',
      empleados: 2,
      total_dias_disponibles: 45,
      total_dias_tomados: 11,
      total_dias_pendientes: 1,
      utilizacion_porcentaje: 24.4
    },
    {
      departamento: 'Ventas',
      empleados: 1,
      total_dias_disponibles: 22,
      total_dias_tomados: 12,
      total_dias_pendientes: 3,
      utilizacion_porcentaje: 54.5
    }
  ]);

  const [vacationTrends] = useState<VacationTrend[]>([
    { mes: 'Enero', dias_solicitados: 45, dias_aprobados: 42, dias_rechazados: 3 },
    { mes: 'Febrero', dias_solicitados: 38, dias_aprobados: 35, dias_rechazados: 3 },
    { mes: 'Marzo', dias_solicitados: 52, dias_aprobados: 48, dias_rechazados: 4 },
    { mes: 'Abril', dias_solicitados: 61, dias_aprobados: 56, dias_rechazados: 5 },
    { mes: 'Mayo', dias_solicitados: 43, dias_aprobados: 40, dias_rechazados: 3 },
    { mes: 'Junio', dias_solicitados: 67, dias_aprobados: 62, dias_rechazados: 5 },
    { mes: 'Julio', dias_solicitados: 78, dias_aprobados: 75, dias_rechazados: 3 },
    { mes: 'Agosto', dias_solicitados: 55, dias_aprobados: 52, dias_rechazados: 3 },
    { mes: 'Septiembre', dias_solicitados: 49, dias_aprobados: 46, dias_rechazados: 3 },
    { mes: 'Octubre', dias_solicitados: 41, dias_aprobados: 38, dias_rechazados: 3 },
    { mes: 'Noviembre', dias_solicitados: 58, dias_aprobados: 54, dias_rechazados: 4 },
    { mes: 'Diciembre', dias_solicitados: 72, dias_aprobados: 68, dias_rechazados: 4 }
  ]);

  const [selectedReport, setSelectedReport] = useState<'general' | 'departamentos' | 'tendencias' | 'individual'>('general');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });

  const generateCSVReport = (type: string) => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'general':
        csvContent = 'Nombre,Apellido,Departamento,Días Disponibles,Días Tomados,Días Pendientes,Último Período,Promedio Mensual\n';
        reportData.forEach(row => {
          csvContent += `${row.nombre},${row.apellido},${row.departamento},${row.dias_disponibles},${row.dias_tomados},${row.dias_pendientes},${row.ultimo_periodo_tomado || 'N/A'},${row.promedio_mensual}\n`;
        });
        filename = 'reporte_general_vacaciones.csv';
        break;
        
      case 'departamentos':
        csvContent = 'Departamento,Empleados,Total Días Disponibles,Total Días Tomados,Total Días Pendientes,% Utilización\n';
        departmentSummaries.forEach(row => {
          csvContent += `${row.departamento},${row.empleados},${row.total_dias_disponibles},${row.total_dias_tomados},${row.total_dias_pendientes},${row.utilizacion_porcentaje}%\n`;
        });
        filename = 'reporte_departamentos_vacaciones.csv';
        break;
        
      case 'tendencias':
        csvContent = 'Mes,Días Solicitados,Días Aprobados,Días Rechazados\n';
        vacationTrends.forEach(row => {
          csvContent += `${row.mes},${row.dias_solicitados},${row.dias_aprobados},${row.dias_rechazados}\n`;
        });
        filename = 'reporte_tendencias_vacaciones.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalStats = () => {
    const totalDisponibles = reportData.reduce((sum, emp) => sum + emp.dias_disponibles, 0);
    const totalTomados = reportData.reduce((sum, emp) => sum + emp.dias_tomados, 0);
    const totalPendientes = reportData.reduce((sum, emp) => sum + emp.dias_pendientes, 0);
    const utilizacionPromedio = (totalTomados / totalDisponibles) * 100;

    return {
      totalDisponibles,
      totalTomados,
      totalPendientes,
      utilizacionPromedio: utilizacionPromedio.toFixed(1)
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Reportes</h2>
          <p className="text-gray-600">Análisis y estadísticas de vacaciones</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => generateCSVReport(selectedReport)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedReport('general')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              selectedReport === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reporte General
          </button>
          <button
            onClick={() => setSelectedReport('departamentos')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              selectedReport === 'departamentos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Por Departamentos
          </button>
          <button
            onClick={() => setSelectedReport('tendencias')}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
              selectedReport === 'tendencias'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tendencias
          </button>
        </nav>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalDisponibles}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalTomados}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalPendientes}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.utilizacionPromedio}%</p>
              <p className="text-sm text-gray-600">Utilización Promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow">
        {selectedReport === 'general' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reporte General de Vacaciones</h3>
              <p className="text-sm text-gray-600">Vista completa del estado de vacaciones por empleado</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tomados</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendientes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Período</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio Mensual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Utilización</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((employee) => {
                    const utilizacion = (employee.dias_tomados / employee.dias_disponibles) * 100;
                    return (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {employee.nombre.charAt(0)}{employee.apellido.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.nombre} {employee.apellido}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.departamento}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{employee.dias_disponibles}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{employee.dias_tomados}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">{employee.dias_pendientes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.ultimo_periodo_tomado ? new Date(employee.ultimo_periodo_tomado).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.promedio_mensual}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  utilizacion < 30 ? 'bg-red-500' : 
                                  utilizacion < 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{width: `${Math.min(utilizacion, 100)}%`}}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{utilizacion.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'departamentos' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reporte por Departamentos</h3>
              <p className="text-sm text-gray-600">Resumen de utilización de vacaciones por departamento</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentSummaries.map((dept, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{dept.departamento}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Empleados:</span>
                        <span className="text-sm font-medium">{dept.empleados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Días Disponibles:</span>
                        <span className="text-sm font-medium text-green-600">{dept.total_dias_disponibles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Días Tomados:</span>
                        <span className="text-sm font-medium text-red-600">{dept.total_dias_tomados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Días Pendientes:</span>
                        <span className="text-sm font-medium text-yellow-600">{dept.total_dias_pendientes}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Utilización:</span>
                          <span className={`text-sm font-bold ${
                            dept.utilizacion_porcentaje < 30 ? 'text-red-600' :
                            dept.utilizacion_porcentaje < 60 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {dept.utilizacion_porcentaje.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              dept.utilizacion_porcentaje < 30 ? 'bg-red-500' :
                              dept.utilizacion_porcentaje < 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{width: `${Math.min(dept.utilizacion_porcentaje, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'tendencias' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tendencias de Vacaciones</h3>
              <p className="text-sm text-gray-600">Análisis mensual de solicitudes y aprobaciones</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aprobados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rechazados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Aprobación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vacationTrends.map((trend, index) => {
                      const porcentajeAprobacion = (trend.dias_aprobados / trend.dias_solicitados) * 100;
                      const prevTrend = index > 0 ? vacationTrends[index - 1] : null;
                      const cambio = prevTrend ? trend.dias_solicitados - prevTrend.dias_solicitados : 0;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.mes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.dias_solicitados}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{trend.dias_aprobados}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{trend.dias_rechazados}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{porcentajeAprobacion.toFixed(1)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {cambio > 0 ? (
                              <span className="text-green-600 flex items-center text-sm">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                                +{cambio}
                              </span>
                            ) : cambio < 0 ? (
                              <span className="text-red-600 flex items-center text-sm">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"></path>
                                </svg>
                                {cambio}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">--</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Chart placeholder */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Gráfico de Tendencias</h4>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-gray-500">Gráfico de tendencias de vacaciones por mes</p>
                    <p className="text-sm text-gray-400">Integración con Chart.js pendiente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsSystem;