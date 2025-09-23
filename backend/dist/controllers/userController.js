"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPotentialManagers = exports.toggleUserStatus = exports.getUserStats = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
const getAllUsers = async (req, res) => {
    try {
        const result = await (0, database_1.queryWithRetry)(`SELECT 
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
      ORDER BY apellido, nombre`);
        const users = result.rows.map((user) => ({
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
        res.json(users);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }
        const result = await (0, database_1.queryWithRetry)(`SELECT 
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
      WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const user = result.rows[0];
        const responseUser = {
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
        };
        res.json(responseUser);
    }
    catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const userFormData = req.body;
        console.log('Datos recibidos para crear usuario:', userFormData);
        if (!userFormData.numeroEmpleado || !userFormData.nombre || !userFormData.apellido ||
            !userFormData.email || !userFormData.fechaContratacion || !userFormData.password) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: numeroEmpleado, nombre, apellido, email, fechaContratacion, password'
            });
        }
        const existingUser = await (0, database_1.queryWithRetry)('SELECT id FROM usuarios WHERE numero_empleado = $1', [userFormData.numeroEmpleado]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Ya existe un usuario con ese número de empleado' });
        }
        const existingEmail = await (0, database_1.queryWithRetry)('SELECT id FROM usuarios WHERE email = $1', [userFormData.email]);
        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(userFormData.password, saltRounds);
        const result = await (0, database_1.queryWithRetry)(`INSERT INTO usuarios (
        numero_empleado, nombre, apellido, email, password_hash, telefono, rol, 
        jefe_superior_id, dias_disponibles, activo, 
        fecha_contratacion, fecha_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) 
      RETURNING *`, [
            userFormData.numeroEmpleado,
            userFormData.nombre,
            userFormData.apellido,
            userFormData.email,
            passwordHash,
            userFormData.telefono,
            userFormData.rol || 'empleado',
            userFormData.jefeSuperiorId || null,
            userFormData.diasDisponibles || 20,
            userFormData.activo ?? true,
            userFormData.fechaContratacion
        ]);
        const newUser = result.rows[0];
        const responseUser = {
            id: newUser.id,
            numeroEmpleado: newUser.numero_empleado,
            nombre: newUser.nombre,
            apellido: newUser.apellido,
            email: newUser.email,
            telefono: newUser.telefono,
            rol: newUser.rol,
            jefeSuperiorId: newUser.jefe_superior_id,
            diasDisponibles: newUser.dias_disponibles,
            activo: newUser.activo,
            fechaContratacion: newUser.fecha_contratacion,
            fechaActualizacion: newUser.fecha_actualizacion
        };
        console.log('Usuario creado exitosamente:', responseUser);
        res.status(201).json(responseUser);
    }
    catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userFormData = req.body;
        console.log('Datos recibidos para actualizar usuario:', userFormData);
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }
        const existingUser = await (0, database_1.queryWithRetry)('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        if (userFormData.numeroEmpleado) {
            const duplicateNumber = await (0, database_1.queryWithRetry)('SELECT id FROM usuarios WHERE numero_empleado = $1 AND id != $2', [userFormData.numeroEmpleado, id]);
            if (duplicateNumber.rows.length > 0) {
                return res.status(400).json({ error: 'Ya existe otro usuario con ese número de empleado' });
            }
        }
        if (userFormData.email) {
            const duplicateEmail = await (0, database_1.queryWithRetry)('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [userFormData.email, id]);
            if (duplicateEmail.rows.length > 0) {
                return res.status(400).json({ error: 'Ya existe otro usuario con ese email' });
            }
        }
        const result = await (0, database_1.queryWithRetry)(`UPDATE usuarios SET
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
      RETURNING *`, [
            id,
            userFormData.numeroEmpleado,
            userFormData.nombre,
            userFormData.apellido,
            userFormData.email,
            userFormData.telefono,
            userFormData.rol,
            userFormData.jefeSuperiorId,
            userFormData.diasDisponibles,
            userFormData.activo,
            userFormData.fechaContratacion
        ]);
        const updatedUser = result.rows[0];
        const responseUser = {
            id: updatedUser.id,
            numeroEmpleado: updatedUser.numero_empleado,
            nombre: updatedUser.nombre,
            apellido: updatedUser.apellido,
            email: updatedUser.email,
            telefono: updatedUser.telefono,
            rol: updatedUser.rol,
            jefeSuperiorId: updatedUser.jefe_superior_id,
            diasDisponibles: updatedUser.dias_disponibles,
            activo: updatedUser.activo,
            fechaContratacion: updatedUser.fecha_contratacion,
            fechaActualizacion: updatedUser.fecha_actualizacion
        };
        console.log('Usuario actualizado exitosamente:', responseUser);
        res.json(responseUser);
    }
    catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }
        const existingUser = await (0, database_1.queryWithRetry)('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const activeRequests = await (0, database_1.queryWithRetry)('SELECT COUNT(*) as count FROM solicitudes_vacaciones WHERE usuario_id = $1', [id]);
        if (parseInt(activeRequests.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el usuario porque tiene solicitudes de vacaciones asociadas'
            });
        }
        await (0, database_1.queryWithRetry)('DELETE FROM usuarios WHERE id = $1', [id]);
        console.log(`Usuario con ID ${id} eliminado exitosamente`);
        res.json({ message: 'Usuario eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.deleteUser = deleteUser;
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await (0, database_1.queryWithRetry)('SELECT COUNT(*) as count FROM usuarios');
        const activeUsers = await (0, database_1.queryWithRetry)('SELECT COUNT(*) as count FROM usuarios WHERE activo = true');
        const usersByRole = await (0, database_1.queryWithRetry)('SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol ORDER BY count DESC');
        const recentUsers = await (0, database_1.queryWithRetry)('SELECT COUNT(*) as count FROM usuarios WHERE fecha_contratacion >= NOW() - INTERVAL \'30 days\'');
        const stats = {
            totalUsers: parseInt(totalUsers.rows[0].count),
            activeUsers: parseInt(activeUsers.rows[0].count),
            inactiveUsers: parseInt(totalUsers.rows[0].count) - parseInt(activeUsers.rows[0].count),
            usersByRole: usersByRole.rows.map((row) => ({
                rol: row.rol,
                count: parseInt(row.count)
            })),
            recentUsers: parseInt(recentUsers.rows[0].count)
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error al obtener estadísticas de usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getUserStats = getUserStats;
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ error: 'ID de usuario inválido' });
        }
        const existingUser = await (0, database_1.queryWithRetry)('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const currentStatus = existingUser.rows[0].activo;
        const newStatus = !currentStatus;
        const result = await (0, database_1.queryWithRetry)(`UPDATE usuarios SET 
        activo = $2,
        fecha_actualizacion = NOW()
      WHERE id = $1
      RETURNING *`, [id, newStatus]);
        const updatedUser = result.rows[0];
        const responseUser = {
            id: updatedUser.id,
            numeroEmpleado: updatedUser.numero_empleado,
            nombre: updatedUser.nombre,
            apellido: updatedUser.apellido,
            email: updatedUser.email,
            telefono: updatedUser.telefono,
            rol: updatedUser.rol,
            jefeSuperiorId: updatedUser.jefe_superior_id,
            diasDisponibles: updatedUser.dias_disponibles,
            activo: updatedUser.activo,
            fechaContratacion: updatedUser.fecha_contratacion,
            fechaActualizacion: updatedUser.fecha_actualizacion
        };
        console.log(`Estado del usuario ${id} cambiado a: ${newStatus ? 'activo' : 'inactivo'}`);
        res.json(responseUser);
    }
    catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.toggleUserStatus = toggleUserStatus;
const getPotentialManagers = async (req, res) => {
    try {
        const result = await (0, database_1.queryWithRetry)(`SELECT 
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
      ORDER BY apellido, nombre`);
        const managers = result.rows.map((user) => ({
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
    }
    catch (error) {
        console.error('Error al obtener jefes potenciales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.getPotentialManagers = getPotentialManagers;
//# sourceMappingURL=userController.js.map