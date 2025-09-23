import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import vacacionesRoutes from './routes/vacaciones';
import reportesRoutes from './routes/reportes';
import configRoutes from './routes/config';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
  }
});

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos de login por IP
  message: {
    error: 'Demasiados intentos de login, intenta de nuevo más tarde.'
  },
  skipSuccessfulRequests: true,
});

app.use(helmet());
app.use(limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4321',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vacaciones', vacacionesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/config', configRoutes);

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `La ruta ${req.originalUrl} no existe en esta API`
  });
});

const startServer = async (): Promise<void> => {
  try {
    console.log('🔄 Iniciando conexión a la base de datos...');
    await connectDB();
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

    server.on('error', (error: any) => {
      console.error('❌ Error del servidor:', error);
    });

    // Manejar señales de cierre graceful
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
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;