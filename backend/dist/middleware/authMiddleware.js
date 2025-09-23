"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitByUser = exports.optionalAuth = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
            return;
        }
        if (!process.env.JWT_SECRET) {
            res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userResult = await (0, database_1.queryWithRetry)('SELECT id, email, rol, activo FROM usuarios WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }
        const user = userResult.rows[0];
        if (!user.activo) {
            res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
            return;
        }
        req.user = {
            userId: user.id,
            email: user.email,
            rol: user.rol
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        else {
            console.error('Error en autenticación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.rol)) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            next();
            return;
        }
        if (!process.env.JWT_SECRET) {
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userResult = await (0, database_1.queryWithRetry)('SELECT id, email, rol, activo FROM usuarios WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length > 0 && userResult.rows[0].activo) {
            const user = userResult.rows[0];
            req.user = {
                userId: user.id,
                email: user.email,
                rol: user.rol
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const rateLimitByUser = (maxRequests, windowMs) => {
    const userRequests = new Map();
    return (req, res, next) => {
        if (!req.user) {
            next();
            return;
        }
        const userId = req.user.userId;
        const now = Date.now();
        const userLimit = userRequests.get(userId);
        if (!userLimit || now > userLimit.resetTime) {
            userRequests.set(userId, {
                count: 1,
                resetTime: now + windowMs
            });
            next();
            return;
        }
        if (userLimit.count >= maxRequests) {
            res.status(429).json({
                success: false,
                message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
            });
            return;
        }
        userLimit.count++;
        next();
    };
};
exports.rateLimitByUser = rateLimitByUser;
//# sourceMappingURL=authMiddleware.js.map