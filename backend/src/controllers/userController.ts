import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { queryWithRetry } from '../config/database';

// Interface for user form data from frontend
interface UserFormData {
  numeroEmpleado?: string;
  nombre?: string;
  apellido?: string;  // Cambiado de apellidos a apellido
  email?: string;
  password?: string;  // Contraseña para crear usuario
  telefono?: string;
  rol?: 'empleado' | 'jefe_superior' | 'rrhh';
  jefeSuperiorId?: number;  // Cambiado de supervisor_id a jefeSuperiorId
  diasDisponibles?: number;  // Cambiado de diasVacaciones a diasDisponibles
  activo?: boolean;
  fechaContratacion?: string;
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await queryWithRetry(
      `SELECT 
        id,
        numero_empleado,
        nombre,
        apellido,
        email,
        telefono,
        rol,
        jefe_superior_id,
        dias_disponibles,
        activo,
        fecha_contratacion,
        fecha_actualizacion
      FROM usuarios 
      ORDER BY apellido, nombre`
    );
    
    const users = result.rows.map((user: any) => ({
      id: user.id,
      numeroEmpleado: user.numero_empleado,
      nombre: user.nombre,
      apellido: user.apellido,  // Backend: apellido -> Frontend: apellido
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      jefeSuperiorId: user.jefe_superior_id,  // Backend: jefe_superior_id -> Frontend: jefeSuperiorId
      diasDisponibles: user.dias_disponibles,  // Backend: dias_disponibles -> Frontend: diasDisponibles
      activo: user.activo,
      fechaContratacion: user.fecha_contratacion,
      fechaActualizacion: user.fecha_actualizacion
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const result = await queryWithRetry(
      `SELECT 
        id,
        numero_empleado,
        nombre,
        apellido,
        email,
        telefono,
        rol,
        jefe_superior_id,
        dias_disponibles,
        activo,
        fecha_contratacion,
        fecha_actualizacion
      FROM usuarios 
      WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const responseUser = {
      id: user.id,
      numeroEmpleado: user.numero_empleado,
      nombre: user.nombre,
      apellido: user.apellido,  // Backend: apellido -> Frontend: apellido
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      jefeSuperiorId: user.jefe_superior_id,  // Backend: jefe_superior_id -> Frontend: jefeSuperiorId
      diasDisponibles: user.dias_disponibles,  // Backend: dias_disponibles -> Frontend: diasDisponibles
      activo: user.activo,
      fechaContratacion: user.fecha_contratacion,
      fechaActualizacion: user.fecha_actualizacion
    };
    
    res.json(responseUser);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userFormData: UserFormData = req.body;
    console.log('Datos recibidos para crear usuario:', userFormData);

    // Validar campos requeridos
    if (!userFormData.numeroEmpleado || !userFormData.nombre || !userFormData.apellido || 
        !userFormData.email || !userFormData.fechaContratacion || !userFormData.password) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: numeroEmpleado, nombre, apellido, email, fechaContratacion, password' 
      });
    }

    // Verificar si ya existe un usuario con el mismo número de empleado
    const existingUser = await queryWithRetry(
      'SELECT id FROM usuarios WHERE numero_empleado = $1',
      [userFormData.numeroEmpleado]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese número de empleado' });
    }

    // Verificar si ya existe un usuario con el mismo email
    const existingEmail = await queryWithRetry(
      'SELECT id FROM usuarios WHERE email = $1',
      [userFormData.email]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userFormData.password, saltRounds);

    const result = await queryWithRetry(
      `INSERT INTO usuarios (
        numero_empleado, nombre, apellido, email, password_hash, telefono, rol, 
        jefe_superior_id, dias_disponibles, activo, 
        fecha_contratacion, fecha_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) 
      RETURNING *`,
      [
        userFormData.numeroEmpleado,
        userFormData.nombre,
        userFormData.apellido,  // apellido del frontend -> apellido en BD
        userFormData.email,
        passwordHash,  // password hasheado
        userFormData.telefono,
        userFormData.rol || 'empleado',
        userFormData.jefeSuperiorId || null,  // jefeSuperiorId del frontend -> jefe_superior_id en BD
        userFormData.diasDisponibles || 20,  // diasDisponibles del frontend -> dias_disponibles en BD
        userFormData.activo ?? true,
        userFormData.fechaContratacion
      ]
    );

    const newUser = result.rows[0];
    const responseUser = {
      id: newUser.id,
      numeroEmpleado: newUser.numero_empleado,
      nombre: newUser.nombre,
      apellido: newUser.apellido,  // Backend: apellido -> Frontend: apellido
      email: newUser.email,
      telefono: newUser.telefono,
      rol: newUser.rol,
      jefeSuperiorId: newUser.jefe_superior_id,  // Backend: jefe_superior_id -> Frontend: jefeSuperiorId
      diasDisponibles: newUser.dias_disponibles,  // Backend: dias_disponibles -> Frontend: diasDisponibles
      activo: newUser.activo,
      fechaContratacion: newUser.fecha_contratacion,
      fechaActualizacion: newUser.fecha_actualizacion
    };

    console.log('Usuario creado exitosamente:', responseUser);
    res.status(201).json(responseUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userFormData: UserFormData = req.body;
    console.log('Datos recibidos para actualizar usuario:', userFormData);

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar si el usuario existe
    const existingUser = await queryWithRetry(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya existe otro usuario con el mismo número de empleado
    if (userFormData.numeroEmpleado) {
      const duplicateNumber = await queryWithRetry(
        'SELECT id FROM usuarios WHERE numero_empleado = $1 AND id != $2',
        [userFormData.numeroEmpleado, id]
      );
      
      if (duplicateNumber.rows.length > 0) {
        return res.status(400).json({ error: 'Ya existe otro usuario con ese número de empleado' });
      }
    }

    // Verificar si ya existe otro usuario con el mismo email
    if (userFormData.email) {
      const duplicateEmail = await queryWithRetry(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [userFormData.email, id]
      );
      
      if (duplicateEmail.rows.length > 0) {
        return res.status(400).json({ error: 'Ya existe otro usuario con ese email' });
      }
    }

    const result = await queryWithRetry(
      `UPDATE usuarios SET
        numero_empleado = COALESCE($2, numero_empleado),
        nombre = COALESCE($3, nombre),
        apellido = COALESCE($4, apellido),
        email = COALESCE($5, email),
        telefono = COALESCE($6, telefono),
        rol = COALESCE($7, rol),
        jefe_superior_id = $8,
        dias_disponibles = COALESCE($9, dias_disponibles),
        activo = COALESCE($10, activo),
        fecha_contratacion = COALESCE($11, fecha_contratacion),
        fecha_actualizacion = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        userFormData.numeroEmpleado,
        userFormData.nombre,
        userFormData.apellido,  // apellido del frontend -> apellido en BD
        userFormData.email,
        userFormData.telefono,
        userFormData.rol,
        userFormData.jefeSuperiorId,  // jefeSuperiorId del frontend -> jefe_superior_id en BD
        userFormData.diasDisponibles,  // diasDisponibles del frontend -> dias_disponibles en BD
        userFormData.activo,
        userFormData.fechaContratacion
      ]
    );

    const updatedUser = result.rows[0];
    const responseUser = {
      id: updatedUser.id,
      numeroEmpleado: updatedUser.numero_empleado,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,  // Backend: apellido -> Frontend: apellido
      email: updatedUser.email,
      telefono: updatedUser.telefono,
      rol: updatedUser.rol,
      jefeSuperiorId: updatedUser.jefe_superior_id,  // Backend: jefe_superior_id -> Frontend: jefeSuperiorId
      diasDisponibles: updatedUser.dias_disponibles,  // Backend: dias_disponibles -> Frontend: diasDisponibles
      activo: updatedUser.activo,
      fechaContratacion: updatedUser.fecha_contratacion,
      fechaActualizacion: updatedUser.fecha_actualizacion
    };

    console.log('Usuario actualizado exitosamente:', responseUser);
    res.json(responseUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar si el usuario existe
    const existingUser = await queryWithRetry(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el usuario tiene solicitudes de vacaciones activas
    const activeRequests = await queryWithRetry(
      'SELECT COUNT(*) as count FROM solicitudes_vacaciones WHERE usuario_id = $1',
      [id]
    );

    if (parseInt(activeRequests.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el usuario porque tiene solicitudes de vacaciones asociadas' 
      });
    }

    // Eliminar el usuario
    await queryWithRetry(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );

    console.log(`Usuario con ID ${id} eliminado exitosamente`);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    // Obtener estadísticas generales de usuarios
    const totalUsers = await queryWithRetry(
      'SELECT COUNT(*) as count FROM usuarios'
    );

    const activeUsers = await queryWithRetry(
      'SELECT COUNT(*) as count FROM usuarios WHERE activo = true'
    );

    const usersByRole = await queryWithRetry(
      'SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol ORDER BY count DESC'
    );

    const recentUsers = await queryWithRetry(
      'SELECT COUNT(*) as count FROM usuarios WHERE fecha_contratacion >= NOW() - INTERVAL \'30 days\''
    );

    const stats = {
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      inactiveUsers: parseInt(totalUsers.rows[0].count) - parseInt(activeUsers.rows[0].count),
      usersByRole: usersByRole.rows.map((row: any) => ({
        rol: row.rol,
        count: parseInt(row.count)
      })),
      recentUsers: parseInt(recentUsers.rows[0].count)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar si el usuario existe y obtener su estado actual
    const existingUser = await queryWithRetry(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const currentStatus = existingUser.rows[0].activo;
    const newStatus = !currentStatus;

    // Actualizar el estado del usuario
    const result = await queryWithRetry(
      `UPDATE usuarios SET 
        activo = $2,
        fecha_actualizacion = NOW()
      WHERE id = $1
      RETURNING *`,
      [id, newStatus]
    );

    const updatedUser = result.rows[0];
    const responseUser = {
      id: updatedUser.id,
      numeroEmpleado: updatedUser.numero_empleado,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,  // Backend: apellido -> Frontend: apellido
      email: updatedUser.email,
      telefono: updatedUser.telefono,
      rol: updatedUser.rol,
      jefeSuperiorId: updatedUser.jefe_superior_id,  // Backend: jefe_superior_id -> Frontend: jefeSuperiorId
      diasDisponibles: updatedUser.dias_disponibles,  // Backend: dias_disponibles -> Frontend: diasDisponibles
      activo: updatedUser.activo,
      fechaContratacion: updatedUser.fecha_contratacion,
      fechaActualizacion: updatedUser.fecha_actualizacion
    };

    console.log(`Estado del usuario ${id} cambiado a: ${newStatus ? 'activo' : 'inactivo'}`);
    res.json(responseUser);
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuarios que pueden ser jefes (para asignación en formularios)
export const getPotentialManagers = async (req: Request, res: Response) => {
  try {
    const result = await queryWithRetry(
      `SELECT 
        id,
        numero_empleado,
        nombre,
        apellido,
        email,
        telefono,
        rol,
        jefe_superior_id,
        dias_disponibles,
        activo,
        fecha_contratacion,
        fecha_actualizacion
      FROM usuarios 
      WHERE rol IN ('jefe_superior', 'rrhh') AND activo = true
      ORDER BY apellido, nombre`
    );
    
    const managers = result.rows.map((user: any) => ({
      id: user.id,
      numeroEmpleado: user.numero_empleado,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      jefeSuperiorId: user.jefe_superior_id,
      diasDisponibles: user.dias_disponibles,
      activo: user.activo,
      fechaContratacion: user.fecha_contratacion,
      fechaActualizacion: user.fecha_actualizacion
    }));
    
    console.log(`Jefes potenciales encontrados: ${managers.length}`);
    res.json({
      message: 'Jefes potenciales obtenidos exitosamente',
      data: managers
    });
  } catch (error) {
    console.error('Error al obtener jefes potenciales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};