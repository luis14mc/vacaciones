import { Router } from 'express';
import {
  getReporteSolicitudes,
  getReportePorDepartamento,
  getReporteUsuarios,
  getEstadisticasGenerales,
  exportarReporte
} from '../controllers/reportesController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Solo RRHH y jefes superiores pueden acceder a los reportes
router.use(authorizeRoles('rrhh', 'jefe_superior'));

// GET /api/reportes/solicitudes - Reporte de solicitudes por período
router.get('/solicitudes', getReporteSolicitudes);

// GET /api/reportes/departamentos - Reporte por departamento
router.get('/departamentos', getReportePorDepartamento);

// GET /api/reportes/usuarios - Reporte de usuarios
router.get('/usuarios', getReporteUsuarios);

// GET /api/reportes/estadisticas - Estadísticas generales del sistema
router.get('/estadisticas', getEstadisticasGenerales);

// GET /api/reportes/exportar - Exportar reportes en diferentes formatos
router.get('/exportar', exportarReporte);

export default router;