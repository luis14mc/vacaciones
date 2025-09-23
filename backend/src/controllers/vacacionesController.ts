import { Request, Response } from 'express';
import { queryWithRetry } from '../config/database';
import { getConfigValue } from './configController';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudVacaciones {
  id: number;
  usuario_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias_solicitados: number;
  motivo: string;
  comentarios?: string;
  estado: EstadoSolicitud;
  aprobador_jefe_id?: number;
  fecha_aprobacion_jefe?: string;
  comentarios_jefe?: string;
  aprobador_rrhh_id?: number;
  fecha_aprobacion_rrhh?: string;
  comentarios_rrhh?: string;
  fecha_rechazo?: string;
  motivo_rechazo?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Campos calculados del join
  usuario_nombre?: string;
  usuario_apellido?: string;
  usuario_numero_empleado?: string;
  jefe_nombre?: string;
  rrhh_nombre?: string;
}

export interface CreateSolicitudRequest {
  fecha_inicio: string;
  fecha_fin: string;
  motivo?: string;
  comentarios?: string;
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
        s.comentarios,
        s.estado,
        s.aprobador_jefe_id,
        s.fecha_aprobacion_jefe,
        s.comentarios_jefe,
        s.aprobador_rrhh_id,
        s.fecha_aprobacion_rrhh,
        s.comentarios_rrhh,
        s.fecha_rechazo,
        s.motivo_rechazo,
        s.fecha_creacion,
        s.fecha_actualizacion,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.numero_empleado as usuario_numero_empleado,
        jefe.nombre || ' ' || jefe.apellido as jefe_nombre,
        rrhh.nombre || ' ' || rrhh.apellido as rrhh_nombre
      FROM solicitudes_vacaciones s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios jefe ON s.aprobador_jefe_id = jefe.id
      LEFT JOIN usuarios rrhh ON s.aprobador_rrhh_id = rrhh.id
      ${whereClause}
      ORDER BY s.fecha_creacion DESC
    `, queryParams);

    const solicitudes: SolicitudVacaciones[] = result.rows.map((row: any) => ({
      id: row.id,
      usuario_id: row.usuario_id,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      dias_solicitados: row.dias_solicitados,
      motivo: row.motivo,
      comentarios: row.comentarios,
      estado: row.estado,
      aprobador_jefe_id: row.aprobador_jefe_id,
      fecha_aprobacion_jefe: row.fecha_aprobacion_jefe,
      comentarios_jefe: row.comentarios_jefe,
      aprobador_rrhh_id: row.aprobador_rrhh_id,
      fecha_aprobacion_rrhh: row.fecha_aprobacion_rrhh,
      comentarios_rrhh: row.comentarios_rrhh,
      fecha_rechazo: row.fecha_rechazo,
      motivo_rechazo: row.motivo_rechazo,
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,
      usuario_nombre: row.usuario_nombre,
      usuario_apellido: row.usuario_apellido,
      usuario_numero_empleado: row.usuario_numero_empleado,
      jefe_nombre: row.jefe_nombre,
      rrhh_nombre: row.rrhh_nombre
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
        s.comentarios,
        s.estado,
        s.aprobador_jefe_id,
        s.fecha_aprobacion_jefe,
        s.comentarios_jefe,
        s.aprobador_rrhh_id,
        s.fecha_aprobacion_rrhh,
        s.comentarios_rrhh,
        s.fecha_rechazo,
        s.motivo_rechazo,
        s.fecha_creacion,
        s.fecha_actualizacion,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.numero_empleado as usuario_numero_empleado,
        jefe.nombre || ' ' || jefe.apellido as jefe_nombre,
        rrhh.nombre || ' ' || rrhh.apellido as rrhh_nombre
      FROM solicitudes_vacaciones s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios jefe ON s.aprobador_jefe_id = jefe.id
      LEFT JOIN usuarios rrhh ON s.aprobador_rrhh_id = rrhh.id
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
      comentarios: result.rows[0].comentarios,
      estado: result.rows[0].estado,
      aprobador_jefe_id: result.rows[0].aprobador_jefe_id,
      fecha_aprobacion_jefe: result.rows[0].fecha_aprobacion_jefe,
      comentarios_jefe: result.rows[0].comentarios_jefe,
      aprobador_rrhh_id: result.rows[0].aprobador_rrhh_id,
      fecha_aprobacion_rrhh: result.rows[0].fecha_aprobacion_rrhh,
      comentarios_rrhh: result.rows[0].comentarios_rrhh,
      fecha_rechazo: result.rows[0].fecha_rechazo,
      motivo_rechazo: result.rows[0].motivo_rechazo,
      fecha_creacion: result.rows[0].fecha_creacion,
      fecha_actualizacion: result.rows[0].fecha_actualizacion,
      usuario_nombre: result.rows[0].usuario_nombre,
      usuario_apellido: result.rows[0].usuario_apellido,
      usuario_numero_empleado: result.rows[0].usuario_numero_empleado,
      jefe_nombre: result.rows[0].jefe_nombre,
      rrhh_nombre: result.rows[0].rrhh_nombre
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
    const { fecha_inicio, fecha_fin, motivo, comentarios }: CreateSolicitudRequest = req.body;
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

    // ============================================
    // VALIDACIONES DE POLÍTICAS DE EMPRESA
    // ============================================

    // Obtener configuraciones del sistema
    const diasAnticiacionMinimo = await getConfigValue('dias_anticipacion_minimo');
    const diasConsecutivosMaximo = await getConfigValue('dias_consecutivos_maximo');
    const diasConsecutivosMinimo = await getConfigValue('dias_consecutivos_minimo');
    const permitirInicioFinSemana = await getConfigValue('permitir_inicio_fin_semana');
    const permitirSolicitudesRetroactivas = await getConfigValue('permitir_solicitudes_retroactivas');

    // 1. Días mínimos de anticipación (configurable)
    const hoy = new Date();
    const diasAnticipacion = Math.ceil((inicioDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (!permitirSolicitudesRetroactivas && diasAnticipacion < 0) {
      res.status(400).json({
        success: false,
        message: 'No se permiten solicitudes con fechas pasadas'
      });
      return;
    }

    if (diasAnticipacion < diasAnticiacionMinimo) {
      res.status(400).json({
        success: false,
        message: `Las solicitudes de vacaciones deben hacerse con al menos ${diasAnticiacionMinimo} días de anticipación`
      });
      return;
    }

    // 2. Límite máximo de días consecutivos (configurable)
    if (diffDays > diasConsecutivosMaximo) {
      res.status(400).json({
        success: false,
        message: `No se pueden solicitar más de ${diasConsecutivosMaximo} días consecutivos de vacaciones`
      });
      return;
    }

    // 3. Límite mínimo de días por solicitud (configurable)
    if (diffDays < diasConsecutivosMinimo) {
      res.status(400).json({
        success: false,
        message: `Debe solicitar al menos ${diasConsecutivosMinimo} día(s) de vacaciones`
      });
      return;
    }

    // 4. Verificar que no sea fin de semana la fecha de inicio (configurable)
    if (!permitirInicioFinSemana) {
      const diaSemana = inicioDate.getDay();
      if (diaSemana === 0 || diaSemana === 6) {
        res.status(400).json({
          success: false,
          message: 'Las vacaciones no pueden iniciar en fin de semana'
        });
        return;
      }
    }

    // ============================================
    // VALIDACIONES DE DISPONIBILIDAD
    // ============================================

    // Obtener más configuraciones del sistema
    const maxSolicitudesPendientes = await getConfigValue('max_solicitudes_pendientes');

    // Verificar máximo de solicitudes pendientes
    const pendientesResult = await queryWithRetry(`
      SELECT COUNT(*) as pendientes 
      FROM solicitudes_vacaciones 
      WHERE usuario_id = $1 AND estado IN ('pendiente_jefe', 'pendiente_rrhh')
    `, [usuario_id]);

    const solicitudesPendientes = parseInt(pendientesResult.rows[0].pendientes);
    if (solicitudesPendientes >= maxSolicitudesPendientes) {
      res.status(400).json({
        success: false,
        message: `Ya tienes el máximo de solicitudes pendientes permitidas (${maxSolicitudesPendientes})`
      });
      return;
    }

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

    // 5. Verificar conflictos de fechas con otras solicitudes
    const conflictResult = await queryWithRetry(`
      SELECT COUNT(*) as conflicts 
      FROM solicitudes_vacaciones 
      WHERE usuario_id = $1 
        AND estado IN ('pendiente_jefe', 'pendiente_rrhh', 'aprobada') 
        AND (
          (fecha_inicio <= $2 AND fecha_fin >= $2) OR
          (fecha_inicio <= $3 AND fecha_fin >= $3) OR
          (fecha_inicio >= $2 AND fecha_fin <= $3)
        )
    `, [usuario_id, fecha_inicio, fecha_fin]);

    if (parseInt(conflictResult.rows[0].conflicts) > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya tienes solicitudes pendientes o aprobadas que se solapan con las fechas solicitadas'
      });
      return;
    }

    // 6. Validar días festivos (si está configurado)
    const permitirDiasFestivos = await getConfigValue('permitir_dias_festivos');
    if (!permitirDiasFestivos) {
      const diasFestivos = await getConfigValue('dias_festivos');
      const fechaInicioStr = fecha_inicio;
      const fechaFinStr = fecha_fin;
      
      // Verificar si alguna de las fechas solicitadas es día festivo
      if (diasFestivos.includes(fechaInicioStr) || diasFestivos.includes(fechaFinStr)) {
        res.status(400).json({
          success: false,
          message: 'No se pueden solicitar días festivos como vacaciones'
        });
        return;
      }
    }

    // ============================================
    // LÓGICA DE APROBACIÓN AUTOMÁTICA
    // ============================================
    
    const autoAprobarMenosDias = await getConfigValue('auto_aprobar_menos_dias');
    const requiereAprobacionJefe = await getConfigValue('requiere_aprobacion_jefe');
    const requiereAprobacionRRHH = await getConfigValue('requiere_aprobacion_rrhh');

    let estadoInicial: string;
    let aprobarAutomaticamente = false;

    // Si está habilitada la auto-aprobación para solicitudes pequeñas
    if (autoAprobarMenosDias > 0 && diffDays <= autoAprobarMenosDias) {
      aprobarAutomaticamente = true;
      estadoInicial = 'aprobada';
    } else if (!requiereAprobacionJefe && !requiereAprobacionRRHH) {
      estadoInicial = 'aprobada';
      aprobarAutomaticamente = true;
    } else if (!requiereAprobacionJefe && requiereAprobacionRRHH) {
      estadoInicial = 'pendiente_rrhh';
    } else {
      estadoInicial = 'pendiente_jefe';
    }

    if (parseInt(conflictResult.rows[0].conflicts) > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya tienes solicitudes pendientes o aprobadas que se solapan con las fechas solicitadas'
      });
      return;
    }

    const result = await queryWithRetry(`
      INSERT INTO solicitudes_vacaciones (
        usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, comentarios, estado, fecha_creacion, fecha_actualizacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, comentarios, estado, fecha_creacion
    `, [usuario_id, fecha_inicio, fecha_fin, diffDays, motivo, comentarios || '', estadoInicial]);

    const newSolicitud = result.rows[0];

    // Si se aprueba automáticamente, descontar días
    if (aprobarAutomaticamente) {
      await queryWithRetry(`
        UPDATE usuarios 
        SET 
          dias_tomados = dias_tomados + $1,
          fecha_actualizacion = NOW()
        WHERE id = $2
      `, [diffDays, usuario_id]);
    }

    const responseMessage = aprobarAutomaticamente 
      ? 'Solicitud creada y aprobada automáticamente' 
      : `Solicitud creada exitosamente. Estado: ${estadoInicial}`;

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
        fecha_solicitud: newSolicitud.fecha_solicitud,
        aprobacion_automatica: aprobarAutomaticamente
      },
      message: responseMessage
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

// ============================================
// MÉTODOS DE APROBACIÓN POR ROLES
// ============================================

/**
 * Aprobar solicitud por jefe inmediato
 */
export const approveByJefe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comentarios_jefe } = req.body;
    const aprobador_jefe_id = (req as any).user?.userId;

    // Verificar que la solicitud existe y está pendiente de jefe
    const existingSolicitud = await queryWithRetry('SELECT * FROM solicitudes_vacaciones WHERE id = $1', [id]);
    if (existingSolicitud.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    const solicitud = existingSolicitud.rows[0];
    
    if (solicitud.estado !== 'pendiente_jefe') {
      res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado pendiente de jefe'
      });
      return;
    }

    // Verificar que el usuario es jefe del empleado solicitante
    const empleadoResult = await queryWithRetry('SELECT jefe_superior_id FROM usuarios WHERE id = $1', [solicitud.usuario_id]);
    if (empleadoResult.rows.length === 0 || empleadoResult.rows[0].jefe_superior_id !== aprobador_jefe_id) {
      res.status(403).json({
        success: false,
        message: 'No tiene autorización para aprobar esta solicitud. Solo el jefe inmediato puede aprobarla.'
      });
      return;
    }

    // Validar días disponibles
    const userResult = await queryWithRetry('SELECT dias_disponibles FROM usuarios WHERE id = $1', [solicitud.usuario_id]);
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    const diasDisponibles = parseFloat(userResult.rows[0].dias_disponibles);
    if (diasDisponibles < solicitud.dias_solicitados) {
      res.status(400).json({
        success: false,
        message: `El empleado solo tiene ${diasDisponibles} días disponibles, pero solicita ${solicitud.dias_solicitados} días`
      });
      return;
    }

    // Verificar conflictos de fechas
    const conflictResult = await queryWithRetry(`
      SELECT COUNT(*) as conflicts 
      FROM solicitudes_vacaciones 
      WHERE usuario_id = $1 
        AND estado IN ('pendiente_rrhh', 'aprobada') 
        AND id != $2
        AND (
          (fecha_inicio <= $3 AND fecha_fin >= $3) OR
          (fecha_inicio <= $4 AND fecha_fin >= $4) OR
          (fecha_inicio >= $3 AND fecha_fin <= $4)
        )
    `, [solicitud.usuario_id, id, solicitud.fecha_inicio, solicitud.fecha_fin]);

    if (parseInt(conflictResult.rows[0].conflicts) > 0) {
      res.status(400).json({
        success: false,
        message: 'Hay conflicto con otras solicitudes aprobadas en las mismas fechas'
      });
      return;
    }

    // Aprobar solicitud (pasa a pendiente_rrhh)
    const result = await queryWithRetry(`
      UPDATE solicitudes_vacaciones 
      SET 
        estado = 'pendiente_rrhh',
        aprobador_jefe_id = $1,
        fecha_aprobacion_jefe = NOW(),
        comentarios_jefe = $2,
        fecha_actualizacion = NOW()
      WHERE id = $3
      RETURNING *
    `, [aprobador_jefe_id, comentarios_jefe || 'Aprobado por jefe', id]);

    res.json({
      success: true,
      message: 'Solicitud aprobada por jefe. Ahora pasa a revisión de RRHH.',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error en approveByJefe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al aprobar solicitud'
    });
  }
};

/**
 * Rechazar solicitud por jefe inmediato
 */
export const rejectByJefe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motivo_rechazo } = req.body;
    const aprobador_jefe_id = (req as any).user?.userId;

    if (!motivo_rechazo) {
      res.status(400).json({
        success: false,
        message: 'El motivo de rechazo es requerido'
      });
      return;
    }

    // Verificar que la solicitud existe y está pendiente de jefe
    const existingSolicitud = await queryWithRetry('SELECT * FROM solicitudes_vacaciones WHERE id = $1', [id]);
    if (existingSolicitud.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    const solicitud = existingSolicitud.rows[0];
    
    if (solicitud.estado !== 'pendiente_jefe') {
      res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado pendiente de jefe'
      });
      return;
    }

    // Verificar que el usuario es jefe del empleado solicitante
    const empleadoResult = await queryWithRetry('SELECT jefe_superior_id FROM usuarios WHERE id = $1', [solicitud.usuario_id]);
    if (empleadoResult.rows.length === 0 || empleadoResult.rows[0].jefe_superior_id !== aprobador_jefe_id) {
      res.status(403).json({
        success: false,
        message: 'No tiene autorización para rechazar esta solicitud. Solo el jefe inmediato puede rechazarla.'
      });
      return;
    }

    // Rechazar solicitud
    const result = await queryWithRetry(`
      UPDATE solicitudes_vacaciones 
      SET 
        estado = 'rechazada',
        aprobador_jefe_id = $1,
        fecha_rechazo = NOW(),
        motivo_rechazo = $2,
        fecha_actualizacion = NOW()
      WHERE id = $3
      RETURNING *
    `, [aprobador_jefe_id, motivo_rechazo, id]);

    res.json({
      success: true,
      message: 'Solicitud rechazada por jefe',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error en rejectByJefe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al rechazar solicitud'
    });
  }
};

/**
 * Aprobar solicitud por RRHH (aprobación final)
 */
export const approveByRRHH = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comentarios_rrhh } = req.body;
    const aprobador_rrhh_id = (req as any).user?.userId;

    // Verificar que el usuario es de RRHH
    const userResult = await queryWithRetry('SELECT rol FROM usuarios WHERE id = $1', [aprobador_rrhh_id]);
    if (userResult.rows.length === 0 || userResult.rows[0].rol !== 'rrhh') {
      res.status(403).json({
        success: false,
        message: 'Solo el personal de RRHH puede realizar esta aprobación'
      });
      return;
    }

    // Verificar que la solicitud existe y está pendiente de RRHH
    const existingSolicitud = await queryWithRetry('SELECT * FROM solicitudes_vacaciones WHERE id = $1', [id]);
    if (existingSolicitud.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    const solicitud = existingSolicitud.rows[0];
    
    if (solicitud.estado !== 'pendiente_rrhh') {
      res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado pendiente de RRHH'
      });
      return;
    }

    // Aprobar solicitud (estado final: aprobada)
    const result = await queryWithRetry(`
      UPDATE solicitudes_vacaciones 
      SET 
        estado = 'aprobada',
        aprobador_rrhh_id = $1,
        fecha_aprobacion_rrhh = NOW(),
        comentarios_rrhh = $2,
        fecha_actualizacion = NOW()
      WHERE id = $3
      RETURNING *
    `, [aprobador_rrhh_id, comentarios_rrhh || 'Aprobado por RRHH', id]);

    // Descontar días del empleado
    await queryWithRetry(`
      UPDATE usuarios 
      SET 
        dias_tomados = dias_tomados + $1,
        fecha_actualizacion = NOW()
      WHERE id = $2
    `, [solicitud.dias_solicitados, solicitud.usuario_id]);

    res.json({
      success: true,
      message: 'Solicitud aprobada completamente por RRHH. Los días han sido descontados.',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error en approveByRRHH:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al aprobar solicitud'
    });
  }
};

/**
 * Rechazar solicitud por RRHH
 */
export const rejectByRRHH = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { motivo_rechazo } = req.body;
    const aprobador_rrhh_id = (req as any).user?.userId;

    if (!motivo_rechazo) {
      res.status(400).json({
        success: false,
        message: 'El motivo de rechazo es requerido'
      });
      return;
    }

    // Verificar que el usuario es de RRHH
    const userResult = await queryWithRetry('SELECT rol FROM usuarios WHERE id = $1', [aprobador_rrhh_id]);
    if (userResult.rows.length === 0 || userResult.rows[0].rol !== 'rrhh') {
      res.status(403).json({
        success: false,
        message: 'Solo el personal de RRHH puede realizar esta acción'
      });
      return;
    }

    // Verificar que la solicitud existe y está pendiente de RRHH
    const existingSolicitud = await queryWithRetry('SELECT * FROM solicitudes_vacaciones WHERE id = $1', [id]);
    if (existingSolicitud.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
      return;
    }

    const solicitud = existingSolicitud.rows[0];
    
    if (solicitud.estado !== 'pendiente_rrhh') {
      res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado pendiente de RRHH'
      });
      return;
    }

    // Rechazar solicitud
    const result = await queryWithRetry(`
      UPDATE solicitudes_vacaciones 
      SET 
        estado = 'rechazada',
        aprobador_rrhh_id = $1,
        fecha_rechazo = NOW(),
        motivo_rechazo = $2,
        fecha_actualizacion = NOW()
      WHERE id = $3
      RETURNING *
    `, [aprobador_rrhh_id, motivo_rechazo, id]);

    res.json({
      success: true,
      message: 'Solicitud rechazada por RRHH',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error en rejectByRRHH:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al rechazar solicitud'
    });
  }
};