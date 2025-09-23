import { Request, Response } from 'express';
import { queryWithRetry } from '../config/database';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudVacaciones {
  id: number;
  usuario_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias_solicitados: number;
  motivo?: string;
  estado: EstadoSolicitud;
  aprobado_por?: number;
  fecha_solicitud: string;
  fecha_respuesta?: string;
  comentarios?: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_departamento?: string;
  aprobador_nombre?: string;
}

export interface CreateSolicitudRequest {
  fecha_inicio: string;
  fecha_fin: string;
  motivo?: string;
}

export interface UpdateSolicitudRequest {
  estado: EstadoSolicitud;
  comentarios?: string;
}

export const getAllSolicitudes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, usuario_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (estado) {
      whereClause += ` AND s.estado = $${paramIndex}`;
      queryParams.push(estado);
      paramIndex++;
    }

    if (usuario_id) {
      whereClause += ` AND s.usuario_id = $${paramIndex}`;
      queryParams.push(usuario_id);
      paramIndex++;
    }

    const result = await queryWithRetry(`
      SELECT 
        s.id,
        s.usuario_id,
        s.fecha_inicio,
        s.fecha_fin,
        s.dias_solicitados,
        s.motivo,
        s.estado,
        s.aprobado_por,
        s.fecha_solicitud,
        s.fecha_respuesta,
        s.comentarios,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.departamento as usuario_departamento,
        a.nombre || ' ' || a.apellido as aprobador_nombre
      FROM solicitudes_vacaciones s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios a ON s.aprobado_por = a.id
      ${whereClause}
      ORDER BY s.fecha_solicitud DESC
    `, queryParams);

    const solicitudes: SolicitudVacaciones[] = result.rows.map((row: any) => ({
      id: row.id,
      usuario_id: row.usuario_id,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      dias_solicitados: row.dias_solicitados,
      motivo: row.motivo,
      estado: row.estado,
      aprobado_por: row.aprobado_por,
      fecha_solicitud: row.fecha_solicitud,
      fecha_respuesta: row.fecha_respuesta,
      comentarios: row.comentarios,
      usuario_nombre: row.usuario_nombre,
      usuario_apellido: row.usuario_apellido,
      usuario_departamento: row.usuario_departamento,
      aprobador_nombre: row.aprobador_nombre
    }));

    res.status(200).json({
      success: true,
      data: solicitudes,
      message: 'Solicitudes obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener solicitudes'
    });
  }
};

export const getSolicitudById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await queryWithRetry(`
      SELECT 
        s.id,
        s.usuario_id,
        s.fecha_inicio,
        s.fecha_fin,
        s.dias_solicitados,
        s.motivo,
        s.estado,
        s.aprobado_por,
        s.fecha_solicitud,
        s.fecha_respuesta,
        s.comentarios,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.departamento as usuario_departamento,
        a.nombre || ' ' || a.apellido as aprobador_nombre
      FROM solicitudes_vacaciones s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios a ON s.aprobado_por = a.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    const solicitud: SolicitudVacaciones = {
      id: result.rows[0].id,
      usuario_id: result.rows[0].usuario_id,
      fecha_inicio: result.rows[0].fecha_inicio,
      fecha_fin: result.rows[0].fecha_fin,
      dias_solicitados: result.rows[0].dias_solicitados,
      motivo: result.rows[0].motivo,
      estado: result.rows[0].estado,
      aprobado_por: result.rows[0].aprobado_por,
      fecha_solicitud: result.rows[0].fecha_solicitud,
      fecha_respuesta: result.rows[0].fecha_respuesta,
      comentarios: result.rows[0].comentarios,
      usuario_nombre: result.rows[0].usuario_nombre,
      usuario_apellido: result.rows[0].usuario_apellido,
      usuario_departamento: result.rows[0].usuario_departamento,
      aprobador_nombre: result.rows[0].aprobador_nombre
    };

    res.status(200).json({
      success: true,
      data: solicitud,
      message: 'Solicitud obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener solicitud'
    });
  }
};

export const createSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin, motivo }: CreateSolicitudRequest = req.body;
    const usuario_id = (req as any).user?.userId; // Del middleware de autenticación
    
    // Validaciones
    if (!fecha_inicio || !fecha_fin || !usuario_id) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: fecha_inicio, fecha_fin'
      });
      return;
    }

    // Calcular días solicitados
    const inicioDate = new Date(fecha_inicio);
    const finDate = new Date(fecha_fin);
    const diffTime = Math.abs(finDate.getTime() - inicioDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Verificar días disponibles del usuario
    const userResult = await queryWithRetry('SELECT dias_disponibles FROM usuarios WHERE id = $1', [usuario_id]);
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    const diasDisponibles = userResult.rows[0].dias_disponibles;
    if (diffDays > diasDisponibles) {
      res.status(400).json({
        success: false,
        message: `No tienes suficientes días disponibles. Solicitaste: ${diffDays}, Disponibles: ${diasDisponibles}`
      });
      return;
    }

    const result = await queryWithRetry(`
      INSERT INTO solicitudes_vacaciones (usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado)
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      RETURNING id, usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado, fecha_solicitud
    `, [usuario_id, fecha_inicio, fecha_fin, diffDays, motivo]);

    const newSolicitud = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: newSolicitud.id,
        usuario_id: newSolicitud.usuario_id,
        fecha_inicio: newSolicitud.fecha_inicio,
        fecha_fin: newSolicitud.fecha_fin,
        dias_solicitados: newSolicitud.dias_solicitados,
        motivo: newSolicitud.motivo,
        estado: newSolicitud.estado,
        fecha_solicitud: newSolicitud.fecha_solicitud
      },
      message: 'Solicitud creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear solicitud'
    });
  }
};

export const updateSolicitud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, comentarios }: UpdateSolicitudRequest = req.body;
    const aprobado_por = (req as any).user?.userId; // Del middleware de autenticación
    
    // Validaciones
    if (!estado) {
      res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
      return;
    }

    // Verificar que la solicitud existe
    const existingSolicitud = await queryWithRetry('SELECT * FROM solicitudes_vacaciones WHERE id = $1', [id]);
    if (existingSolicitud.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    const solicitud = existingSolicitud.rows[0];

    // Si se aprueba, descontar días del usuario
    if (estado === 'aprobada' && solicitud.estado === 'pendiente') {
      await queryWithRetry(
        'UPDATE usuarios SET dias_disponibles = dias_disponibles - $1 WHERE id = $2',
        [solicitud.dias_solicitados, solicitud.usuario_id]
      );
    }

    const result = await queryWithRetry(`
      UPDATE solicitudes_vacaciones 
      SET estado = $1, comentarios = $2, aprobado_por = $3, fecha_respuesta = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado, aprobado_por, fecha_solicitud, fecha_respuesta, comentarios
    `, [estado, comentarios, aprobado_por, id]);

    const updatedSolicitud = result.rows[0];

    res.status(200).json({
      success: true,
      data: updatedSolicitud,
      message: 'Solicitud actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar solicitud'
    });
  }
};

export const getSolicitudesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const statsResult = await queryWithRetry(`
      SELECT 
        COUNT(*) as total_solicitudes,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'aprobada') as aprobadas,
        COUNT(*) FILTER (WHERE estado = 'rechazada') as rechazadas,
        SUM(dias_solicitados) FILTER (WHERE estado = 'aprobada') as total_dias_aprobados
      FROM solicitudes_vacaciones
    `);

    const stats = statsResult.rows[0];

    res.status(200).json({
      success: true,
      data: {
        total_solicitudes: parseInt(stats.total_solicitudes),
        pendientes: parseInt(stats.pendientes),
        aprobadas: parseInt(stats.aprobadas),
        rechazadas: parseInt(stats.rechazadas),
        total_dias_aprobados: parseInt(stats.total_dias_aprobados || 0)
      },
      message: 'Estadísticas obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};