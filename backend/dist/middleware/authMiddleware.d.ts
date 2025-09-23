import { Request, Response, NextFunction } from 'express';
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
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimitByUser: (maxRequests: number, windowMs: number) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
