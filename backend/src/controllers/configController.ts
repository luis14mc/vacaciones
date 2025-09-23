import { Request, Response } from 'express';
import { queryWithRetry } from '../config/database';

export type TipoConfiguracion = 'string' | 'number' | 'boolean' | 'json';

export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  tipo: TipoConfiguracion;
  descripcion?: string;
  categoria: string;
  es_editable: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateConfiguracionRequest {
  clave: string;
  valor: string;
  tipo: TipoConfiguracion;
  descripcion?: string;
  categoria?: string;
  es_editable?: boolean;
}

export interface UpdateConfiguracionRequest {
  valor?: string;
  descripcion?: string;
  categoria?: string;
  es_editable?: boolean;
}

/**
 * Obtener todas las configuraciones del sistema
 */
export const getAllConfiguraciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, es_editable } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
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

    const result = await queryWithRetry(`
      SELECT * FROM configuraciones 
      ${whereClause}
      ORDER BY categoria, clave
    `, queryParams);

    const configuraciones: Configuracion[] = result.rows.map((row: any) => ({
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
    
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuraciones'
    });
  }
};

/**
 * Obtener una configuración por clave
 */
export const getConfiguracionByClave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave } = req.params;
    
    const result = await queryWithRetry('SELECT * FROM configuraciones WHERE clave = $1', [clave]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
      return;
    }

    const configuracion: Configuracion = {
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
    
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuración'
    });
  }
};

/**
 * Crear nueva configuración
 */
export const createConfiguracion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave, valor, tipo, descripcion, categoria, es_editable }: CreateConfiguracionRequest = req.body;
    
    // Validaciones
    if (!clave || !valor || !tipo) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: clave, valor, tipo'
      });
      return;
    }

    // Validar tipo
    const tiposValidos: TipoConfiguracion[] = ['string', 'number', 'boolean', 'json'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({
        success: false,
        message: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}`
      });
      return;
    }

    // Validar valor según tipo
    if (!validarValorPorTipo(valor, tipo)) {
      res.status(400).json({
        success: false,
        message: `El valor no es válido para el tipo ${tipo}`
      });
      return;
    }

    // Verificar que la clave no existe
    const existingResult = await queryWithRetry('SELECT id FROM configuraciones WHERE clave = $1', [clave]);
    if (existingResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe una configuración con esa clave'
      });
      return;
    }

    const result = await queryWithRetry(`
      INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_editable)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [clave, valor, tipo, descripcion || '', categoria || 'general', es_editable !== false]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Configuración creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error creando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear configuración'
    });
  }
};

/**
 * Actualizar configuración existente
 */
export const updateConfiguracion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave } = req.params;
    const { valor, descripcion, categoria, es_editable }: UpdateConfiguracionRequest = req.body;
    
    // Verificar que la configuración existe
    const existingResult = await queryWithRetry('SELECT * FROM configuraciones WHERE clave = $1', [clave]);
    if (existingResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
      return;
    }

    const configuracionExistente = existingResult.rows[0];

    // Verificar que es editable
    if (!configuracionExistente.es_editable) {
      res.status(403).json({
        success: false,
        message: 'Esta configuración no es editable'
      });
      return;
    }

    // Si se proporciona valor, validarlo según el tipo
    if (valor !== undefined && !validarValorPorTipo(valor, configuracionExistente.tipo)) {
      res.status(400).json({
        success: false,
        message: `El valor no es válido para el tipo ${configuracionExistente.tipo}`
      });
      return;
    }

    // Construir query de actualización dinámicamente
    const fieldsToUpdate: string[] = [];
    const queryParams: any[] = [];
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

    // Agregar fecha_actualizacion y clave para WHERE
    fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    queryParams.push(clave);

    const result = await queryWithRetry(`
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
    
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar configuración'
    });
  }
};

/**
 * Eliminar configuración
 */
export const deleteConfiguracion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave } = req.params;
    
    // Verificar que la configuración existe
    const existingResult = await queryWithRetry('SELECT * FROM configuraciones WHERE clave = $1', [clave]);
    if (existingResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
      return;
    }

    const configuracionExistente = existingResult.rows[0];

    // Verificar que es editable (solo las editables se pueden eliminar)
    if (!configuracionExistente.es_editable) {
      res.status(403).json({
        success: false,
        message: 'Esta configuración no se puede eliminar'
      });
      return;
    }

    await queryWithRetry('DELETE FROM configuraciones WHERE clave = $1', [clave]);

    res.status(200).json({
      success: true,
      message: 'Configuración eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar configuración'
    });
  }
};

/**
 * Obtener configuraciones por categoría
 */
export const getConfiguracionesByCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria } = req.params;
    
    const result = await queryWithRetry(`
      SELECT * FROM configuraciones 
      WHERE categoria = $1 
      ORDER BY clave
    `, [categoria]);

    const configuraciones: Configuracion[] = result.rows.map((row: any) => ({
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
    
  } catch (error) {
    console.error('Error obteniendo configuraciones por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuraciones'
    });
  }
};

/**
 * Obtener listado de categorías disponibles
 */
export const getCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await queryWithRetry(`
      SELECT DISTINCT categoria, COUNT(*) as total_configuraciones
      FROM configuraciones 
      GROUP BY categoria 
      ORDER BY categoria
    `);

    const categorias = result.rows.map((row: any) => ({
      categoria: row.categoria,
      total_configuraciones: parseInt(row.total_configuraciones)
    }));

    res.status(200).json({
      success: true,
      data: categorias,
      message: 'Categorías obtenidas exitosamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener categorías'
    });
  }
};

/**
 * Función utilitaria para obtener valor tipado de configuración
 */
export const getConfigValue = async (clave: string): Promise<any> => {
  try {
    const result = await queryWithRetry('SELECT valor, tipo FROM configuraciones WHERE clave = $1', [clave]);
    
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
  } catch (error) {
    console.error(`Error obteniendo configuración '${clave}':`, error);
    throw error;
  }
};

/**
 * Función utilitaria para validar valor según tipo
 */
function validarValorPorTipo(valor: string, tipo: TipoConfiguracion): boolean {
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
  } catch {
    return false;
  }
}

/**
 * Obtener múltiples configuraciones de una vez (batch)
 */
export const getConfiguracionesBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { claves } = req.body; // Array de claves
    
    if (!Array.isArray(claves) || claves.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Se requiere un array de claves'
      });
      return;
    }

    const placeholders = claves.map((_, index) => `$${index + 1}`).join(',');
    const result = await queryWithRetry(`
      SELECT * FROM configuraciones 
      WHERE clave IN (${placeholders})
      ORDER BY clave
    `, claves);

    // Crear objeto con valores tipados
    const configuracionesTyped: { [key: string]: any } = {};
    result.rows.forEach((row: any) => {
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
    
  } catch (error) {
    console.error('Error obteniendo configuraciones batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuraciones'
    });
  }
};