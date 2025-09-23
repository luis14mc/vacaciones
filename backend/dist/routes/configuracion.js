"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configuracionController_1 = require("../controllers/configuracionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.use((0, authMiddleware_1.authorizeRoles)('rrhh'));
router.get('/', configuracionController_1.getAllConfiguraciones);
router.get('/vacaciones', configuracionController_1.getConfiguracionVacaciones);
router.put('/vacaciones', configuracionController_1.updateConfiguracionVacaciones);
router.get('/:clave', configuracionController_1.getConfiguracionByClave);
router.put('/:clave', configuracionController_1.updateConfiguracion);
router.post('/:categoria/reset', configuracionController_1.resetConfiguracionDefecto);
router.get('/:clave/historial', configuracionController_1.getHistorialConfiguracion);
exports.default = router;
//# sourceMappingURL=configuracion.js.map