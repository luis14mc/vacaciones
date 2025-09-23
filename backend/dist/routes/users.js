"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get('/', (0, authMiddleware_1.authorizeRoles)('rrhh', 'jefe_superior'), userController_1.getAllUsers);
router.get('/potential-managers', (0, authMiddleware_1.authorizeRoles)('rrhh'), userController_1.getPotentialManagers);
router.get('/stats', (0, authMiddleware_1.authorizeRoles)('rrhh', 'jefe_superior'), userController_1.getUserStats);
router.get('/:id', (0, authMiddleware_1.authorizeRoles)('rrhh', 'jefe_superior'), userController_1.getUserById);
router.post('/', (0, authMiddleware_1.authorizeRoles)('rrhh'), userController_1.createUser);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('rrhh'), userController_1.updateUser);
router.patch('/:id/status', (0, authMiddleware_1.authorizeRoles)('rrhh'), userController_1.toggleUserStatus);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('rrhh'), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map