import { Request, Response } from 'express';
import pool from '../config/database';

export interface ReporteSolicitudes {
  periodo: string;
  total_solicitudes: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
  dias_totales: number;
}

export interface ReportePorDepartamento {
  departamento: string;
  total_empleados: number;
  solicitudes_pendientes: number;
  solicitudes_aprobadas: number;
  dias_usados: number;
  dias_disponibles: number;
}

export interface ReporteUsuario {
  usuario_id: number;
  nombre: string;
  apellido: string;
  departamento: string;
  dias_disponibles: number;
  dias_usados: number;
  solicitudes_pendientes: number;
  solicitudes_aprobadas: number;
  ultima_solicitud?: string;
}

export const getReporteSolicitudes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin, grupo_por = 'mes' } = req.query;
    
    let dateFormat = 'YYYY-MM';
    if (grupo_por === 'año') {
      dateFormat = 'YYYY';
    } else if (grupo_por === 'semana') {
      dateFormat = 'YYYY-"W"WW';
    }

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (fecha_inicio && fecha_fin) {
      whereClause = `WHERE fecha_solicitud BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      queryParams.push(fecha_inicio, fecha_fin);
      paramIndex += 2;
    }

    const result = await pool.query(`
      SELECT 
        TO_CHAR(fecha_solicitud, '${dateFormat}') as periodo,
        COUNT(*) as total_solicitudes,
        COUNT(*) FILTER (WHERE estado = 'aprobada') as aprobadas,
        COUNT(*) FILTER (WHERE estado = 'rechazada') as rechazadas,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COALESCE(SUM(dias_solicitados) FILTER (WHERE estado = 'aprobada'), 0) as dias_totales
      FROM solicitudes_vacaciones
      ${whereClause}
      GROUP BY TO_CHAR(fecha_solicitud, '${dateFormat}')
      ORDER BY periodo DESC
    `, queryParams);

    const reportes: ReporteSolicitudes[] = result.rows.map((row: any) => ({
      periodo: row.periodo,
      total_solicitudes: parseInt(row.total_solicitudes),
      aprobadas: parseInt(row.aprobadas),
      rechazadas: parseInt(row.rechazadas),
      pendientes: parseInt(row.pendientes),
      dias_totales: parseInt(row.dias_totales)
    }));

    res.status(200).json({
      success: true,
      data: reportes,
      message: 'Reporte de solicitudes obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo reporte de solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener reporte'
    });
  }
};

export const getReportePorDepartamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(u.departamento, 'Sin Departamento') as departamento,
        COUNT(DISTINCT u.id) as total_empleados,
        COUNT(s.id) FILTER (WHERE s.estado = 'pendiente') as solicitudes_pendientes,
        COUNT(s.id) FILTER (WHERE s.estado = 'aprobada') as solicitudes_aprobadas,
        COALESCE(SUM(s.dias_solicitados) FILTER (WHERE s.estado = 'aprobada'), 0) as dias_usados,
        SUM(u.dias_disponibles) as dias_disponibles
      FROM usuarios u
      LEFT JOIN solicitudes_vacaciones s ON u.id = s.usuario_id
      WHERE u.activo = true
      GROUP BY COALESCE(u.departamento, 'Sin Departamento')
      ORDER BY departamento
    `);

    const reportes: ReportePorDepartamento[] = result.rows.map((row: any) => ({
      departamento: row.departamento,
      total_empleados: parseInt(row.total_empleados),
      solicitudes_pendientes: parseInt(row.solicitudes_pendientes),
      solicitudes_aprobadas: parseInt(row.solicitudes_aprobadas),
      dias_usados: parseInt(row.dias_usados),
      dias_disponibles: parseInt(row.dias_disponibles || 0)
    }));

    res.status(200).json({
      success: true,
      data: reportes,
      message: 'Reporte por departamento obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo reporte por departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener reporte'
    });
  }
};

export const getReporteUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departamento, dias_minimos } = req.query;
    
    let whereClause = 'WHERE u.activo = true';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (departamento) {
      whereClause += ` AND u.departamento = $${paramIndex}`;
      queryParams.push(departamento);
      paramIndex++;
    }

    if (dias_minimos) {
      whereClause += ` AND u.dias_disponibles >= $${paramIndex}`;
      queryParams.push(dias_minimos);
      paramIndex++;
    }

    const result = await pool.query(`
      SELECT 
        u.id as usuario_id,
        u.nombre,
        u.apellido,
        COALESCE(u.departamento, 'Sin Departamento') as departamento,
        u.dias_disponibles,
        COALESCE(SUM(s.dias_solicitados) FILTER (WHERE s.estado = 'aprobada'), 0) as dias_usados,
        COUNT(s.id) FILTER (WHERE s.estado = 'pendiente') as solicitudes_pendientes,
        COUNT(s.id) FILTER (WHERE s.estado = 'aprobada') as solicitudes_aprobadas,
        MAX(s.fecha_solicitud) as ultima_solicitud
      FROM usuarios u
      LEFT JOIN solicitudes_vacaciones s ON u.id = s.usuario_id
      ${whereClause}
      GROUP BY u.id, u.nombre, u.apellido, u.departamento, u.dias_disponibles
      ORDER BY u.apellido, u.nombre
    `, queryParams);

    const reportes: ReporteUsuario[] = result.rows.map((row: any) => ({
      usuario_id: row.usuario_id,
      nombre: row.nombre,
      apellido: row.apellido,
      departamento: row.departamento,
      dias_disponibles: parseInt(row.dias_disponibles),
      dias_usados: parseInt(row.dias_usados),
      solicitudes_pendientes: parseInt(row.solicitudes_pendientes),
      solicitudes_aprobadas: parseInt(row.solicitudes_aprobadas),
      ultima_solicitud: row.ultima_solicitud
    }));

    res.status(200).json({
      success: true,
      data: reportes,
      message: 'Reporte de usuarios obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo reporte de usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener reporte'
    });
  }
};

export const getEstadisticasGenerales = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener estadísticas de usuarios
    const usuariosStats = await pool.query(`
      SELECT 
        COUNT(*) as total_usuarios,
        COUNT(*) FILTER (WHERE activo = true) as usuarios_activos,
        AVG(dias_disponibles) as promedio_dias_disponibles,
        SUM(dias_disponibles) as total_dias_disponibles
      FROM usuarios
    `);

    // Obtener estadísticas de solicitudes
    const solicitudesStats = await pool.query(`
      SELECT 
        COUNT(*) as total_solicitudes,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'aprobada') as aprobadas,
        COUNT(*) FILTER (WHERE estado = 'rechazada') as rechazadas,
        AVG(dias_solicitados) as promedio_dias_solicitud,
        SUM(dias_solicitados) FILTER (WHERE estado = 'aprobada') as total_dias_aprobados
      FROM solicitudes_vacaciones
    `);

    // Obtener estadísticas por departamento
    const departamentosStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT departamento) as total_departamentos
      FROM usuarios 
      WHERE departamento IS NOT NULL AND activo = true
    `);

    // Obtener solicitudes del mes actual
    const solicitudesMesActual = await pool.query(`
      SELECT COUNT(*) as solicitudes_mes_actual
      FROM solicitudes_vacaciones
      WHERE DATE_TRUNC('month', fecha_solicitud) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    const usuarios = usuariosStats.rows[0];
    const solicitudes = solicitudesStats.rows[0];
    const departamentos = departamentosStats.rows[0];
    const mesActual = solicitudesMesActual.rows[0];

    res.status(200).json({
      success: true,
      data: {
        usuarios: {
          total: parseInt(usuarios.total_usuarios),
          activos: parseInt(usuarios.usuarios_activos),
          promedio_dias_disponibles: parseFloat(usuarios.promedio_dias_disponibles || 0).toFixed(1),
          total_dias_disponibles: parseInt(usuarios.total_dias_disponibles || 0)
        },
        solicitudes: {
          total: parseInt(solicitudes.total_solicitudes),
          pendientes: parseInt(solicitudes.pendientes),
          aprobadas: parseInt(solicitudes.aprobadas),
          rechazadas: parseInt(solicitudes.rechazadas),
          promedio_dias_solicitud: parseFloat(solicitudes.promedio_dias_solicitud || 0).toFixed(1),
          total_dias_aprobados: parseInt(solicitudes.total_dias_aprobados || 0)
        },
        departamentos: {
          total: parseInt(departamentos.total_departamentos)
        },
        actividad_reciente: {
          solicitudes_mes_actual: parseInt(mesActual.solicitudes_mes_actual)
        }
      },
      message: 'Estadísticas generales obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

export const exportarReporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, formato = 'json', fecha_inicio, fecha_fin } = req.query;
    
    let data: any;
    let filename: string;

    switch (tipo) {
      case 'solicitudes':
        const solicitudesResult = await pool.query(`
          SELECT 
            s.id,
            u.nombre || ' ' || u.apellido as empleado,
            u.departamento,
            s.fecha_inicio,
            s.fecha_fin,
            s.dias_solicitados,
            s.estado,
            s.fecha_solicitud,
            a.nombre || ' ' || a.apellido as aprobado_por
          FROM solicitudes_vacaciones s
          INNER JOIN usuarios u ON s.usuario_id = u.id
          LEFT JOIN usuarios a ON s.aprobado_por = a.id
          ${fecha_inicio && fecha_fin ? 'WHERE s.fecha_solicitud BETWEEN $1 AND $2' : ''}
          ORDER BY s.fecha_solicitud DESC
        `, fecha_inicio && fecha_fin ? [fecha_inicio, fecha_fin] : []);
        
        data = solicitudesResult.rows;
        filename = `reporte_solicitudes_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'usuarios':
        const usuariosResult = await pool.query(`
          SELECT 
            u.nombre,
            u.apellido,
            u.email,
            u.departamento,
            u.rol,
            u.dias_disponibles,
            u.activo,
            COUNT(s.id) as total_solicitudes,
            COUNT(s.id) FILTER (WHERE s.estado = 'aprobada') as solicitudes_aprobadas
          FROM usuarios u
          LEFT JOIN solicitudes_vacaciones s ON u.id = s.usuario_id
          WHERE u.activo = true
          GROUP BY u.id, u.nombre, u.apellido, u.email, u.departamento, u.rol, u.dias_disponibles, u.activo
          ORDER BY u.apellido, u.nombre
        `);
        
        data = usuariosResult.rows;
        filename = `reporte_usuarios_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Tipo de reporte no válido. Use: solicitudes, usuarios'
        });
        return;
    }

    if (formato === 'csv') {
      // Convertir a CSV
      if (data.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No hay datos para exportar'
        });
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row: any) => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      // Retornar JSON
      res.status(200).json({
        success: true,
        data: data,
        filename: `${filename}.json`,
        message: 'Reporte exportado exitosamente'
      });
    }
    
  } catch (error) {
    console.error('Error exportando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al exportar reporte'
    });
  }
};