import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus,
  getPotentialManagers
} from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/users - Obtener todos los usuarios (solo RRHH y jefes superiores)
router.get('/', authorizeRoles('rrhh', 'jefe_superior'), getAllUsers);

// GET /api/users/potential-managers - Obtener usuarios que pueden ser jefes (solo RRHH)
router.get('/potential-managers', authorizeRoles('rrhh'), getPotentialManagers);

// GET /api/users/stats - Obtener estadísticas de usuarios
router.get('/stats', authorizeRoles('rrhh', 'jefe_superior'), getUserStats);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', authorizeRoles('rrhh', 'jefe_superior'), getUserById);

// POST /api/users - Crear nuevo usuario (solo RRHH)
router.post('/', authorizeRoles('rrhh'), createUser);

// PUT /api/users/:id - Actualizar usuario (solo RRHH)
router.put('/:id', authorizeRoles('rrhh'), updateUser);

// PATCH /api/users/:id/status - Cambiar estado activo/inactivo del usuario (solo RRHH)
router.patch('/:id/status', authorizeRoles('rrhh'), toggleUserStatus);

// DELETE /api/users/:id - Eliminar usuario (solo RRHH)
router.delete('/:id', authorizeRoles('rrhh'), deleteUser);

export default router;