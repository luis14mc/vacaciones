"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const vacaciones_1 = __importDefault(require("./routes/vacaciones"));
const reportes_1 = __importDefault(require("./routes/reportes"));
const config_1 = __importDefault(require("./routes/config"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
    }
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Demasiados intentos de login, intenta de nuevo más tarde.'
    },
    skipSuccessfulRequests: true,
});
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4321',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/vacaciones', vacaciones_1.default);
app.use('/api/reportes', reportes_1.default);
app.use('/api/config', config_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'API de Vacaciones CNI funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            vacaciones: '/api/vacaciones',
            reportes: '/api/reportes',
            config: '/api/config'
        }
    });
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'JSON inválido en el cuerpo de la solicitud'
        });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'El archivo es demasiado grande'
        });
    }
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message
    });
});
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `La ruta ${req.originalUrl} no existe en esta API`
    });
});
const startServer = async () => {
    try {
        console.log('🔄 Iniciando conexión a la base de datos...');
        await (0, database_1.connectDB)();
        console.log('✅ Base de datos conectada, iniciando servidor...');
        const server = app.listen(PORT, 'localhost', () => {
            console.log(`🚀 Servidor backend iniciado en http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
            console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
            console.log(`🏖️ Vacaciones API: http://localhost:${PORT}/api/vacaciones`);
            console.log(`📈 Reportes API: http://localhost:${PORT}/api/reportes`);
            console.log(`⚙️ Config API: http://localhost:${PORT}/api/config`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('✅ Servidor escuchando correctamente en el puerto', PORT);
        });
        server.on('error', (error) => {
            console.error('❌ Error del servidor:', error);
        });
        process.on('SIGTERM', () => {
            console.log('📛 SIGTERM recibido, cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('📛 SIGINT recibido (Ctrl+C), cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map