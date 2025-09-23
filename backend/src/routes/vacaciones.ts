import { Router } from 'express';
import {
  getAllSolicitudes,
  getSolicitudById,
  createSolicitud,
  updateSolicitud,
  getSolicitudesStats,
  approveByJefe,
  rejectByJefe,
  approveByRRHH,
  rejectByRRHH
} from '../controllers/vacacionesController';
import { authenticateToken, authorizeRoles, rateLimitByUser } from '../middleware/authMiddleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/solicitudes - Obtener todas las solicitudes
router.get('/', (req, res, next) => {
  const userRole = (req as any).user?.rol;
  const userId = (req as any).user?.userId;
  
  // Si es empleado, filtrar solo sus solicitudes
  if (userRole === 'empleado') {
    req.query.usuario_id = userId.toString();
  }
  
  next();
}, getAllSolicitudes);

// GET /api/solicitudes/stats - Obtener estadísticas de solicitudes
router.get('/stats', authorizeRoles('rrhh', 'jefe_superior'), getSolicitudesStats);

// GET /api/solicitudes/:id - Obtener solicitud por ID
router.get('/:id', getSolicitudById);

// POST /api/solicitudes - Crear nueva solicitud
router.post('/', rateLimitByUser(5, 60 * 60 * 1000), createSolicitud);

// PUT /api/solicitudes/:id - Actualizar solicitud
router.put('/:id', authorizeRoles('rrhh', 'jefe_superior'), updateSolicitud);

// ============================================
// RUTAS DE APROBACIÓN POR ROLES
// ============================================

// POST /api/solicitudes/:id/approve-jefe - Aprobar por jefe
router.post('/:id/approve-jefe', authorizeRoles('jefe_superior'), approveByJefe);

// POST /api/solicitudes/:id/reject-jefe - Rechazar por jefe
router.post('/:id/reject-jefe', authorizeRoles('jefe_superior'), rejectByJefe);

// POST /api/solicitudes/:id/approve-rrhh - Aprobar por RRHH
router.post('/:id/approve-rrhh', authorizeRoles('rrhh'), approveByRRHH);

// POST /api/solicitudes/:id/reject-rrhh - Rechazar por RRHH
router.post('/:id/reject-rrhh', authorizeRoles('rrhh'), rejectByRRHH);

export default router;