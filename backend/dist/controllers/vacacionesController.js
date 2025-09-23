"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSolicitudesStats = exports.updateSolicitud = exports.createSolicitud = exports.getSolicitudById = exports.getAllSolicitudes = void 0;
const database_1 = require("../config/database");
const getAllSolicitudes = async (req, res) => {
    try {
        const { estado, usuario_id } = req.query;
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
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
        const result = await (0, database_1.queryWithRetry)(`
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
        const solicitudes = result.rows.map((row) => ({
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
    }
    catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener solicitudes'
        });
    }
};
exports.getAllSolicitudes = getAllSolicitudes;
const getSolicitudById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.queryWithRetry)(`
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
        const solicitud = {
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
    }
    catch (error) {
        console.error('Error obteniendo solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener solicitud'
        });
    }
};
exports.getSolicitudById = getSolicitudById;
const createSolicitud = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, motivo } = req.body;
        const usuario_id = req.user?.userId;
        if (!fecha_inicio || !fecha_fin || !usuario_id) {
            res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: fecha_inicio, fecha_fin'
            });
            return;
        }
        const inicioDate = new Date(fecha_inicio);
        const finDate = new Date(fecha_fin);
        const diffTime = Math.abs(finDate.getTime() - inicioDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const userResult = await pool.query('SELECT dias_disponibles FROM usuarios WHERE id = $1', [usuario_id]);
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
        const result = await (0, database_1.queryWithRetry)(`
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
    }
    catch (error) {
        console.error('Error creando solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear solicitud'
        });
    }
};
exports.createSolicitud = createSolicitud;
const updateSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, comentarios } = req.body;
        const aprobado_por = req.user?.userId;
        if (!estado) {
            res.status(400).json({
                success: false,
                message: 'El estado es requerido'
            });
            return;
        }
        const existingSolicitud = await pool.query('SELECT * FROM solicitudes_vacaciones WHERE id = $1', [id]);
        if (existingSolicitud.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
            return;
        }
        const solicitud = existingSolicitud.rows[0];
        if (estado === 'aprobada' && solicitud.estado === 'pendiente') {
            await (0, database_1.queryWithRetry)('UPDATE usuarios SET dias_disponibles = dias_disponibles - $1 WHERE id = $2', [solicitud.dias_solicitados, solicitud.usuario_id]);
        }
        const result = await (0, database_1.queryWithRetry)(`
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
    }
    catch (error) {
        console.error('Error actualizando solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar solicitud'
        });
    }
};
exports.updateSolicitud = updateSolicitud;
const getSolicitudesStats = async (req, res) => {
    try {
        const statsResult = await (0, database_1.queryWithRetry)(`
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
    }
    catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener estadísticas'
        });
    }
};
exports.getSolicitudesStats = getSolicitudesStats;
//# sourceMappingURL=vacacionesController.js.map