import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ 
      error: 'Token de acceso requerido',
      code: 'NO_TOKEN' 
    });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(403).json({ 
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN' 
      });
      return;
    }

    req.user = decoded as JWTPayload;
    next();
  });
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'No autenticado',
        code: 'NOT_AUTHENTICATED' 
      });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
      return;
    }

    next();
  };
};