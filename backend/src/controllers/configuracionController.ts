import { Request, Response } from 'express';
import pool from '../config/database';

export interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string;
  categoria: string;
  fecha_actualizacion: string;
}

export interface UpdateConfigRequest {
  valor: string;
}

export interface ConfiguracionVacaciones {
  dias_maximos_por_solicitud: number;
  dias_minimos_anticipo: number;
  dias_anuales_empleado: number;
  permite_fraccionamiento: boolean;
  requiere_aprobacion_jefe: boolean;
  notificaciones_email: boolean;
}

export const getAllConfiguraciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria } = req.query;
    
    let whereClause = '';
    const queryParams: any[] = [];
    
    if (categoria) {
      whereClause = 'WHERE categoria = $1';
      queryParams.push(categoria);
    }

    const result = await pool.query(`
      SELECT id, clave, valor, descripcion, categoria, fecha_actualizacion
      FROM configuracion_sistema
      ${whereClause}
      ORDER BY categoria, clave
    `, queryParams);

    const configuraciones: ConfiguracionSistema[] = result.rows.map((row: any) => ({
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
    
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuraciones'
    });
  }
};

export const getConfiguracionByClave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave } = req.params;
    
    const result = await pool.query(`
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

    const configuracion: ConfiguracionSistema = {
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
    
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuración'
    });
  }
};

export const updateConfiguracion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave } = req.params;
    const { valor }: UpdateConfigRequest = req.body;
    
    if (!valor) {
      res.status(400).json({
        success: false,
        message: 'El valor es requerido'
      });
      return;
    }

    // Verificar que la configuración existe
    const existingConfig = await pool.query('SELECT id FROM configuracion_sistema WHERE clave = $1', [clave]);
    if (existingConfig.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
      return;
    }

    const result = await pool.query(`
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
    
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar configuración'
    });
  }
};

export const getConfiguracionVacaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT clave, valor
      FROM configuracion_sistema
      WHERE categoria = 'vacaciones'
    `);

    const configMap = new Map();
    result.rows.forEach((row: any) => {
      configMap.set(row.clave, row.valor);
    });

    const configuracion: ConfiguracionVacaciones = {
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
    
  } catch (error) {
    console.error('Error obteniendo configuración de vacaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener configuración'
    });
  }
};

export const updateConfiguracionVacaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const configuracion: Partial<ConfiguracionVacaciones> = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Actualizar cada configuración
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
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error actualizando configuración de vacaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar configuración'
    });
  }
};

export const resetConfiguracionDefecto = async (req: Request, res: Response): Promise<void> => {
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

    const defaults = configuracionesDefecto[categoria as keyof typeof configuracionesDefecto];
    
    if (!defaults) {
      res.status(400).json({
        success: false,
        message: 'Categoría no válida'
      });
      return;
    }

    const client = await pool.connect();
    
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
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error restableciendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al restablecer configuración'
    });
  }
};

export const getHistorialConfiguracion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clave } = req.params;
    const { limite = 10 } = req.query;
    
    const result = await pool.query(`
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

    const historial = result.rows.map((row: any) => ({
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
    
  } catch (error) {
    console.error('Error obteniendo historial de configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener historial'
    });
  }
};