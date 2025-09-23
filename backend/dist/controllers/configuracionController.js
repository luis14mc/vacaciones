"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistorialConfiguracion = exports.resetConfiguracionDefecto = exports.updateConfiguracionVacaciones = exports.getConfiguracionVacaciones = exports.updateConfiguracion = exports.getConfiguracionByClave = exports.getAllConfiguraciones = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllConfiguraciones = async (req, res) => {
    try {
        const { categoria } = req.query;
        let whereClause = '';
        const queryParams = [];
        if (categoria) {
            whereClause = 'WHERE categoria = $1';
            queryParams.push(categoria);
        }
        const result = await database_1.default.query(`
      SELECT id, clave, valor, descripcion, categoria, fecha_actualizacion
      FROM configuracion_sistema
      ${whereClause}
      ORDER BY categoria, clave
    `, queryParams);
        const configuraciones = result.rows.map((row) => ({
            id: row.id,
            clave: row.clave,
            valor: row.valor,
            descripcion: row.descripcion,
            categoria: row.categoria,
            fecha_actualizacion: row.fecha_actualizacion
        }));
        res.status(200).json({
            success: true,
            data: configuraciones,
            message: 'Configuraciones obtenidas exitosamente'
        });
    }
    catch (error) {
        console.error('Error obteniendo configuraciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener configuraciones'
        });
    }
};
exports.getAllConfiguraciones = getAllConfiguraciones;
const getConfiguracionByClave = async (req, res) => {
    try {
        const { clave } = req.params;
        const result = await database_1.default.query(`
      SELECT id, clave, valor, descripcion, categoria, fecha_actualizacion
      FROM configuracion_sistema
      WHERE clave = $1
    `, [clave]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }
        const configuracion = {
            id: result.rows[0].id,
            clave: result.rows[0].clave,
            valor: result.rows[0].valor,
            descripcion: result.rows[0].descripcion,
            categoria: result.rows[0].categoria,
            fecha_actualizacion: result.rows[0].fecha_actualizacion
        };
        res.status(200).json({
            success: true,
            data: configuracion,
            message: 'Configuración obtenida exitosamente'
        });
    }
    catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener configuración'
        });
    }
};
exports.getConfiguracionByClave = getConfiguracionByClave;
const updateConfiguracion = async (req, res) => {
    try {
        const { clave } = req.params;
        const { valor } = req.body;
        if (!valor) {
            res.status(400).json({
                success: false,
                message: 'El valor es requerido'
            });
            return;
        }
        const existingConfig = await database_1.default.query('SELECT id FROM configuracion_sistema WHERE clave = $1', [clave]);
        if (existingConfig.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }
        const result = await database_1.default.query(`
      UPDATE configuracion_sistema 
      SET valor = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE clave = $2
      RETURNING id, clave, valor, descripcion, categoria, fecha_actualizacion
    `, [valor, clave]);
        const updatedConfig = result.rows[0];
        res.status(200).json({
            success: true,
            data: {
                id: updatedConfig.id,
                clave: updatedConfig.clave,
                valor: updatedConfig.valor,
                descripcion: updatedConfig.descripcion,
                categoria: updatedConfig.categoria,
                fecha_actualizacion: updatedConfig.fecha_actualizacion
            },
            message: 'Configuración actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar configuración'
        });
    }
};
exports.updateConfiguracion = updateConfiguracion;
const getConfiguracionVacaciones = async (req, res) => {
    try {
        const result = await database_1.default.query(`
      SELECT clave, valor
      FROM configuracion_sistema
      WHERE categoria = 'vacaciones'
    `);
        const configMap = new Map();
        result.rows.forEach((row) => {
            configMap.set(row.clave, row.valor);
        });
        const configuracion = {
            dias_maximos_por_solicitud: parseInt(configMap.get('dias_maximos_por_solicitud') || '30'),
            dias_minimos_anticipo: parseInt(configMap.get('dias_minimos_anticipo') || '7'),
            dias_anuales_empleado: parseInt(configMap.get('dias_anuales_empleado') || '20'),
            permite_fraccionamiento: configMap.get('permite_fraccionamiento') === 'true',
            requiere_aprobacion_jefe: configMap.get('requiere_aprobacion_jefe') === 'true',
            notificaciones_email: configMap.get('notificaciones_email') === 'true'
        };
        res.status(200).json({
            success: true,
            data: configuracion,
            message: 'Configuración de vacaciones obtenida exitosamente'
        });
    }
    catch (error) {
        console.error('Error obteniendo configuración de vacaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener configuración'
        });
    }
};
exports.getConfiguracionVacaciones = getConfiguracionVacaciones;
const updateConfiguracionVacaciones = async (req, res) => {
    try {
        const configuracion = req.body;
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            for (const [clave, valor] of Object.entries(configuracion)) {
                await client.query(`
          UPDATE configuracion_sistema 
          SET valor = $1, fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE clave = $2 AND categoria = 'vacaciones'
        `, [valor.toString(), clave]);
            }
            await client.query('COMMIT');
            res.status(200).json({
                success: true,
                message: 'Configuración de vacaciones actualizada exitosamente'
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error actualizando configuración de vacaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar configuración'
        });
    }
};
exports.updateConfiguracionVacaciones = updateConfiguracionVacaciones;
const resetConfiguracionDefecto = async (req, res) => {
    try {
        const { categoria } = req.params;
        const configuracionesDefecto = {
            vacaciones: {
                dias_maximos_por_solicitud: '30',
                dias_minimos_anticipo: '7',
                dias_anuales_empleado: '20',
                permite_fraccionamiento: 'true',
                requiere_aprobacion_jefe: 'true',
                notificaciones_email: 'true'
            },
            sistema: {
                sesion_duracion_minutos: '480',
                max_intentos_login: '3',
                bloqueo_duracion_minutos: '30',
                backup_automatico: 'true',
                logs_nivel: 'info'
            }
        };
        const defaults = configuracionesDefecto[categoria];
        if (!defaults) {
            res.status(400).json({
                success: false,
                message: 'Categoría no válida'
            });
            return;
        }
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            for (const [clave, valor] of Object.entries(defaults)) {
                await client.query(`
          UPDATE configuracion_sistema 
          SET valor = $1, fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE clave = $2 AND categoria = $3
        `, [valor, clave, categoria]);
            }
            await client.query('COMMIT');
            res.status(200).json({
                success: true,
                message: `Configuración de ${categoria} restablecida a valores por defecto`
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error restableciendo configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al restablecer configuración'
        });
    }
};
exports.resetConfiguracionDefecto = resetConfiguracionDefecto;
const getHistorialConfiguracion = async (req, res) => {
    try {
        const { clave } = req.params;
        const { limite = 10 } = req.query;
        const result = await database_1.default.query(`
      SELECT 
        h.id,
        h.clave,
        h.valor_anterior,
        h.valor_nuevo,
        h.fecha_cambio,
        u.nombre || ' ' || u.apellido as usuario_cambio
      FROM historial_configuracion h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.clave = $1
      ORDER BY h.fecha_cambio DESC
      LIMIT $2
    `, [clave, limite]);
        const historial = result.rows.map((row) => ({
            id: row.id,
            clave: row.clave,
            valor_anterior: row.valor_anterior,
            valor_nuevo: row.valor_nuevo,
            fecha_cambio: row.fecha_cambio,
            usuario_cambio: row.usuario_cambio
        }));
        res.status(200).json({
            success: true,
            data: historial,
            message: 'Historial de configuración obtenido exitosamente'
        });
    }
    catch (error) {
        console.error('Error obteniendo historial de configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener historial'
        });
    }
};
exports.getHistorialConfiguracion = getHistorialConfiguracion;
//# sourceMappingURL=configuracionController.js.map