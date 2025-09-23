"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vacacionesController_1 = require("../controllers/vacacionesController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get('/', (req, res, next) => {
    const userRole = req.user?.rol;
    const userId = req.user?.userId;
    if (userRole === 'empleado') {
        req.query.usuario_id = userId.toString();
    }
    next();
}, vacacionesController_1.getAllSolicitudes);
router.get('/stats', (0, authMiddleware_1.authorizeRoles)('rrhh', 'jefe_superior'), vacacionesController_1.getSolicitudesStats);
router.get('/:id', vacacionesController_1.getSolicitudById);
router.post('/', (0, authMiddleware_1.rateLimitByUser)(5, 60 * 60 * 1000), vacacionesController_1.createSolicitud);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('rrhh', 'jefe_superior'), vacacionesController_1.updateSolicitud);
exports.default = router;
//# sourceMappingURL=vacaciones.js.map