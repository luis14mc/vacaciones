"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguracionesBatch = exports.getConfigValue = exports.getCategorias = exports.getConfiguracionesByCategoria = exports.deleteConfiguracion = exports.updateConfiguracion = exports.createConfiguracion = exports.getConfiguracionByClave = exports.getAllConfiguraciones = void 0;
const database_1 = require("../config/database");
const getAllConfiguraciones = async (req, res) => {
    try {
        const { categoria, es_editable } = req.query;
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        let paramIndex = 1;
        if (categoria) {
            whereClause += ` AND categoria = $${paramIndex}`;
            queryParams.push(categoria);
            paramIndex++;
        }
        if (es_editable !== undefined) {
            whereClause += ` AND es_editable = $${paramIndex}`;
            queryParams.push(es_editable === 'true');
            paramIndex++;
        }
        const result = await (0, database_1.queryWithRetry)(`
      SELECT * FROM configuraciones 
      ${whereClause}
      ORDER BY categoria, clave
    `, queryParams);
        const configuraciones = result.rows.map((row) => ({
            id: row.id,
            clave: row.clave,
            valor: row.valor,
            tipo: row.tipo,
            descripcion: row.descripcion,
            categoria: row.categoria,
            es_editable: row.es_editable,
            fecha_creacion: row.fecha_creacion,
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
        const result = await (0, database_1.queryWithRetry)('SELECT * FROM configuraciones WHERE clave = $1', [clave]);
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
            tipo: result.rows[0].tipo,
            descripcion: result.rows[0].descripcion,
            categoria: result.rows[0].categoria,
            es_editable: result.rows[0].es_editable,
            fecha_creacion: result.rows[0].fecha_creacion,
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
const createConfiguracion = async (req, res) => {
    try {
        const { clave, valor, tipo, descripcion, categoria, es_editable } = req.body;
        if (!clave || !valor || !tipo) {
            res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: clave, valor, tipo'
            });
            return;
        }
        const tiposValidos = ['string', 'number', 'boolean', 'json'];
        if (!tiposValidos.includes(tipo)) {
            res.status(400).json({
                success: false,
                message: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}`
            });
            return;
        }
        if (!validarValorPorTipo(valor, tipo)) {
            res.status(400).json({
                success: false,
                message: `El valor no es válido para el tipo ${tipo}`
            });
            return;
        }
        const existingResult = await (0, database_1.queryWithRetry)('SELECT id FROM configuraciones WHERE clave = $1', [clave]);
        if (existingResult.rows.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Ya existe una configuración con esa clave'
            });
            return;
        }
        const result = await (0, database_1.queryWithRetry)(`
      INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_editable)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [clave, valor, tipo, descripcion || '', categoria || 'general', es_editable !== false]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Configuración creada exitosamente'
        });
    }
    catch (error) {
        console.error('Error creando configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear configuración'
        });
    }
};
exports.createConfiguracion = createConfiguracion;
const updateConfiguracion = async (req, res) => {
    try {
        const { clave } = req.params;
        const { valor, descripcion, categoria, es_editable } = req.body;
        const existingResult = await (0, database_1.queryWithRetry)('SELECT * FROM configuraciones WHERE clave = $1', [clave]);
        if (existingResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }
        const configuracionExistente = existingResult.rows[0];
        if (!configuracionExistente.es_editable) {
            res.status(403).json({
                success: false,
                message: 'Esta configuración no es editable'
            });
            return;
        }
        if (valor !== undefined && !validarValorPorTipo(valor, configuracionExistente.tipo)) {
            res.status(400).json({
                success: false,
                message: `El valor no es válido para el tipo ${configuracionExistente.tipo}`
            });
            return;
        }
        const fieldsToUpdate = [];
        const queryParams = [];
        let paramIndex = 1;
        if (valor !== undefined) {
            fieldsToUpdate.push(`valor = $${paramIndex}`);
            queryParams.push(valor);
            paramIndex++;
        }
        if (descripcion !== undefined) {
            fieldsToUpdate.push(`descripcion = $${paramIndex}`);
            queryParams.push(descripcion);
            paramIndex++;
        }
        if (categoria !== undefined) {
            fieldsToUpdate.push(`categoria = $${paramIndex}`);
            queryParams.push(categoria);
            paramIndex++;
        }
        if (es_editable !== undefined) {
            fieldsToUpdate.push(`es_editable = $${paramIndex}`);
            queryParams.push(es_editable);
            paramIndex++;
        }
        if (fieldsToUpdate.length === 0) {
            res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
            return;
        }
        fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
        queryParams.push(clave);
        const result = await (0, database_1.queryWithRetry)(`
      UPDATE configuraciones 
      SET ${fieldsToUpdate.join(', ')}
      WHERE clave = $${paramIndex}
      RETURNING *
    `, queryParams);
        res.status(200).json({
            success: true,
            data: result.rows[0],
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
const deleteConfiguracion = async (req, res) => {
    try {
        const { clave } = req.params;
        const existingResult = await (0, database_1.queryWithRetry)('SELECT * FROM configuraciones WHERE clave = $1', [clave]);
        if (existingResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
            return;
        }
        const configuracionExistente = existingResult.rows[0];
        if (!configuracionExistente.es_editable) {
            res.status(403).json({
                success: false,
                message: 'Esta configuración no se puede eliminar'
            });
            return;
        }
        await (0, database_1.queryWithRetry)('DELETE FROM configuraciones WHERE clave = $1', [clave]);
        res.status(200).json({
            success: true,
            message: 'Configuración eliminada exitosamente'
        });
    }
    catch (error) {
        console.error('Error eliminando configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar configuración'
        });
    }
};
exports.deleteConfiguracion = deleteConfiguracion;
const getConfiguracionesByCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;
        const result = await (0, database_1.queryWithRetry)(`
      SELECT * FROM configuraciones 
      WHERE categoria = $1 
      ORDER BY clave
    `, [categoria]);
        const configuraciones = result.rows.map((row) => ({
            id: row.id,
            clave: row.clave,
            valor: row.valor,
            tipo: row.tipo,
            descripcion: row.descripcion,
            categoria: row.categoria,
            es_editable: row.es_editable,
            fecha_creacion: row.fecha_creacion,
            fecha_actualizacion: row.fecha_actualizacion
        }));
        res.status(200).json({
            success: true,
            data: configuraciones,
            message: `Configuraciones de categoría '${categoria}' obtenidas exitosamente`
        });
    }
    catch (error) {
        console.error('Error obteniendo configuraciones por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener configuraciones'
        });
    }
};
exports.getConfiguracionesByCategoria = getConfiguracionesByCategoria;
const getCategorias = async (req, res) => {
    try {
        const result = await (0, database_1.queryWithRetry)(`
      SELECT DISTINCT categoria, COUNT(*) as total_configuraciones
      FROM configuraciones 
      GROUP BY categoria 
      ORDER BY categoria
    `);
        const categorias = result.rows.map((row) => ({
            categoria: row.categoria,
            total_configuraciones: parseInt(row.total_configuraciones)
        }));
        res.status(200).json({
            success: true,
            data: categorias,
            message: 'Categorías obtenidas exitosamente'
        });
    }
    catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener categorías'
        });
    }
};
exports.getCategorias = getCategorias;
const getConfigValue = async (clave) => {
    try {
        const result = await (0, database_1.queryWithRetry)('SELECT valor, tipo FROM configuraciones WHERE clave = $1', [clave]);
        if (result.rows.length === 0) {
            throw new Error(`Configuración '${clave}' no encontrada`);
        }
        const { valor, tipo } = result.rows[0];
        switch (tipo) {
            case 'number':
                return parseFloat(valor);
            case 'boolean':
                return valor === 'true';
            case 'json':
                return JSON.parse(valor);
            case 'string':
            default:
                return valor;
        }
    }
    catch (error) {
        console.error(`Error obteniendo configuración '${clave}':`, error);
        throw error;
    }
};
exports.getConfigValue = getConfigValue;
function validarValorPorTipo(valor, tipo) {
    try {
        switch (tipo) {
            case 'number':
                return !isNaN(parseFloat(valor)) && isFinite(parseFloat(valor));
            case 'boolean':
                return valor === 'true' || valor === 'false';
            case 'json':
                JSON.parse(valor);
                return true;
            case 'string':
                return typeof valor === 'string';
            default:
                return false;
        }
    }
    catch {
        return false;
    }
}
const getConfiguracionesBatch = async (req, res) => {
    try {
        const { claves } = req.body;
        if (!Array.isArray(claves) || claves.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Se requiere un array de claves'
            });
            return;
        }
        const placeholders = claves.map((_, index) => `$${index + 1}`).join(',');
        const result = await (0, database_1.queryWithRetry)(`
      SELECT * FROM configuraciones 
      WHERE clave IN (${placeholders})
      ORDER BY clave
    `, claves);
        const configuracionesTyped = {};
        result.rows.forEach((row) => {
            const { clave, valor, tipo } = row;
            switch (tipo) {
                case 'number':
                    configuracionesTyped[clave] = parseFloat(valor);
                    break;
                case 'boolean':
                    configuracionesTyped[clave] = valor === 'true';
                    break;
                case 'json':
                    configuracionesTyped[clave] = JSON.parse(valor);
                    break;
                case 'string':
                default:
                    configuracionesTyped[clave] = valor;
            }
        });
        res.status(200).json({
            success: true,
            data: configuracionesTyped,
            message: 'Configuraciones obtenidas exitosamente'
        });
    }
    catch (error) {
        console.error('Error obteniendo configuraciones batch:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener configuraciones'
        });
    }
};
exports.getConfiguracionesBatch = getConfiguracionesBatch;
//# sourceMappingURL=configController.js.map