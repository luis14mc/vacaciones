"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
class AuthController {
    static async login(req, res) {
        console.log("🔐 Login attempt received");
        console.log("Body:", req.body);
        try {
            const { email, password } = req.body;
            console.log("Email:", email, "Password length:", password?.length);
            if (!email || !password) {
                console.log("❌ Missing email or password");
                res.status(400).json({
                    error: 'Email y contraseña son requeridos'
                });
                return;
            }
            console.log("🔍 Searching user in database...");
            const userQuery = 'SELECT * FROM usuarios WHERE email = $1 AND activo = true';
            const userResult = await database_1.default.query(userQuery, [email]);
            console.log("User query result:", userResult.rows.length, "rows");
            if (userResult.rows.length === 0) {
                console.log("❌ User not found");
                res.status(401).json({
                    error: 'Credenciales inválidas'
                });
                return;
            }
            const user = userResult.rows[0];
            console.log("✅ User found:", user.email);
            console.log("🔐 Verifying password...");
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
            console.log("Password valid:", isPasswordValid);
            if (!isPasswordValid) {
                console.log("❌ Invalid password");
                res.status(401).json({
                    error: 'Credenciales inválidas'
                });
                return;
            }
            console.log("🔑 Generating tokens...");
            const jwtSecret = process.env.JWT_SECRET;
            const refreshSecret = process.env.JWT_REFRESH_SECRET;
            console.log("JWT_SECRET exists:", !!jwtSecret);
            console.log("JWT_REFRESH_SECRET exists:", !!refreshSecret);
            if (!jwtSecret || !refreshSecret) {
                console.log("❌ JWT configuration missing");
                res.status(500).json({
                    error: 'Configuración de JWT no válida'
                });
                return;
            }
            const tokenPayload = {
                id: user.id,
                userId: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol,
                dias_disponibles: user.dias_disponibles
            };
            console.log("Token payload:", tokenPayload);
            const token = jsonwebtoken_1.default.sign(tokenPayload, jwtSecret, {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, refreshSecret, {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
            });
            console.log("✅ Tokens generated successfully");
            const { password_hash: _, ...userWithoutPassword } = user;
            const authResponse = {
                user: userWithoutPassword,
                token,
                refreshToken
            };
            console.log("✅ Sending successful response");
            res.status(200).json({
                message: 'Login exitoso',
                data: authResponse
            });
        }
        catch (error) {
            console.error('💥 Error en login:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    error: 'Refresh token requerido'
                });
                return;
            }
            jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
                if (err) {
                    res.status(403).json({
                        error: 'Refresh token inválido'
                    });
                    return;
                }
                const userQuery = 'SELECT * FROM usuarios WHERE id = $1 AND activo = true';
                const userResult = await database_1.default.query(userQuery, [decoded.userId]);
                if (userResult.rows.length === 0) {
                    res.status(404).json({
                        error: 'Usuario no encontrado'
                    });
                    return;
                }
                const user = userResult.rows[0];
                const newToken = jsonwebtoken_1.default.sign({
                    id: user.id,
                    userId: user.id,
                    email: user.email,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    rol: user.rol,
                    dias_disponibles: user.dias_disponibles
                }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
                res.status(200).json({
                    message: 'Token renovado exitosamente',
                    data: { token: newToken }
                });
            });
        }
        catch (error) {
            console.error('Error en refresh token:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    error: 'No autenticado'
                });
                return;
            }
            const userQuery = 'SELECT * FROM usuarios WHERE id = $1 AND activo = true';
            const userResult = await database_1.default.query(userQuery, [userId]);
            if (userResult.rows.length === 0) {
                res.status(404).json({
                    error: 'Usuario no encontrado'
                });
                return;
            }
            const user = userResult.rows[0];
            const { password_hash: _, ...userWithoutPassword } = user;
            res.status(200).json({
                message: 'Perfil obtenido exitosamente',
                data: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
    static async logout(req, res) {
        try {
            const userId = req.user?.userId;
            if (userId) {
                await database_1.default.query('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
            }
            res.status(200).json({
                message: 'Logout exitoso'
            });
        }
        catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
    static async validateToken(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
                return;
            }
            const userQuery = 'SELECT id, email, nombre, apellido, rol, activo FROM usuarios WHERE id = $1';
            const userResult = await database_1.default.query(userQuery, [userId]);
            if (userResult.rows.length === 0 || !userResult.rows[0].activo) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no válido'
                });
                return;
            }
            const user = userResult.rows[0];
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        rol: user.rol
                    }
                },
                message: 'Token válido'
            });
        }
        catch (error) {
            console.error('Error validando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map