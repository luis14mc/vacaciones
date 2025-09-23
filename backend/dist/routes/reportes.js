"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesController_1 = require("../controllers/reportesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.use((0, authMiddleware_1.authorizeRoles)('rrhh', 'jefe_superior'));
router.get('/solicitudes', reportesController_1.getReporteSolicitudes);
router.get('/departamentos', reportesController_1.getReportePorDepartamento);
router.get('/usuarios', reportesController_1.getReporteUsuarios);
router.get('/estadisticas', reportesController_1.getEstadisticasGenerales);
router.get('/exportar', reportesController_1.exportarReporte);
exports.default = router;
//# sourceMappingURL=reportes.js.map