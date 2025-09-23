"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', authController_1.AuthController.login);
router.post('/refresh-token', authController_1.AuthController.refreshToken);
router.get('/profile', authMiddleware_1.authenticateToken, authController_1.AuthController.getProfile);
router.post('/logout', authMiddleware_1.authenticateToken, authController_1.AuthController.logout);
router.get('/validate', authMiddleware_1.authenticateToken, authController_1.AuthController.validateToken);
exports.default = router;
//# sourceMappingURL=auth.js.map