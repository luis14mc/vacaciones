import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryWithRetry } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    rol: string;
  };
}

export interface JWTPayload {
  userId: number;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

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

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    // Verificar que el usuario existe y está activo
    const userResult = await queryWithRetry(
      'SELECT id, email, rol, activo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

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

    // TODO: Actualizar último acceso cuando se cree la columna ultimo_acceso
    // await pool.query(
    //   'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
    //   [user.id]
    // );

    // Agregar información del usuario a la request
    req.user = {
      userId: user.id,
      email: user.email,
      rol: user.rol
    };

    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    } else {
      console.error('Error en autenticación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    const userResult = await queryWithRetry(
      'SELECT id, email, rol, activo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0 && userResult.rows[0].activo) {
      const user = userResult.rows[0];
      req.user = {
        userId: user.id,
        email: user.email,
        rol: user.rol
      };
    }

    next();
    
  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
};

export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<number, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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