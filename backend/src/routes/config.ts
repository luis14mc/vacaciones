import { Router } from 'express';
import { 
  getAllConfiguraciones,
  getConfiguracionByClave,
  createConfiguracion,
  updateConfiguracion,
  deleteConfiguracion,
  getConfiguracionesByCategoria,
  getCategorias,
  getConfiguracionesBatch
} from '../controllers/configController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route GET /api/config
 * @desc Obtener todas las configuraciones del sistema
 * @query categoria - Filtrar por categoría (opcional)
 * @query es_editable - Filtrar por editables (opcional)
 * @access Private (Admin/RRHH)
 */
router.get('/', getAllConfiguraciones);

/**
 * @route GET /api/config/categorias
 * @desc Obtener listado de categorías disponibles
 * @access Private (Admin/RRHH)
 */
router.get('/categorias', getCategorias);

/**
 * @route POST /api/config/batch
 * @desc Obtener múltiples configuraciones por claves
 * @body { claves: string[] }
 * @access Private
 */
router.post('/batch', getConfiguracionesBatch);

/**
 * @route GET /api/config/categoria/:categoria
 * @desc Obtener configuraciones por categoría
 * @param categoria - Nombre de la categoría
 * @access Private (Admin/RRHH)
 */
router.get('/categoria/:categoria', getConfiguracionesByCategoria);

/**
 * @route GET /api/config/:clave
 * @desc Obtener configuración específica por clave
 * @param clave - Clave única de la configuración
 * @access Private
 */
router.get('/:clave', getConfiguracionByClave);

/**
 * @route POST /api/config
 * @desc Crear nueva configuración
 * @body { clave, valor, tipo, descripcion?, categoria?, es_editable? }
 * @access Private (Admin/RRHH)
 */
router.post('/', authorizeRoles('rrhh'), createConfiguracion);

/**
 * @route PUT /api/config/:clave
 * @desc Actualizar configuración existente
 * @param clave - Clave única de la configuración
 * @body { valor?, descripcion?, categoria?, es_editable? }
 * @access Private (Admin/RRHH)
 */
router.put('/:clave', authorizeRoles('rrhh'), updateConfiguracion);

/**
 * @route DELETE /api/config/:clave
 * @desc Eliminar configuración (solo si es editable)
 * @param clave - Clave única de la configuración
 * @access Private (Admin/RRHH)
 */
router.delete('/:clave', authorizeRoles('rrhh'), deleteConfiguracion);

export default router;