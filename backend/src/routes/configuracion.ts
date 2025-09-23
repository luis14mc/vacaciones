import { Router } from 'express';
import {
  getAllConfiguraciones,
  getConfiguracionByClave,
  updateConfiguracion,
  getConfiguracionVacaciones,
  updateConfiguracionVacaciones,
  resetConfiguracionDefecto,
  getHistorialConfiguracion
} from '../controllers/configuracionController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Solo RRHH puede gestionar la configuración
router.use(authorizeRoles('rrhh'));

// GET /api/configuracion - Obtener todas las configuraciones
router.get('/', getAllConfiguraciones);

// GET /api/configuracion/vacaciones - Obtener configuración específica de vacaciones
router.get('/vacaciones', getConfiguracionVacaciones);

// PUT /api/configuracion/vacaciones - Actualizar configuración de vacaciones
router.put('/vacaciones', updateConfiguracionVacaciones);

// GET /api/configuracion/:clave - Obtener configuración por clave
router.get('/:clave', getConfiguracionByClave);

// PUT /api/configuracion/:clave - Actualizar configuración por clave
router.put('/:clave', updateConfiguracion);

// POST /api/configuracion/:categoria/reset - Restablecer configuración por defecto
router.post('/:categoria/reset', resetConfiguracionDefecto);

// GET /api/configuracion/:clave/historial - Obtener historial de cambios
router.get('/:clave/historial', getHistorialConfiguracion);

export default router;