import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        numeroEmpleado: string;
        rol: string;
    };
    token: string;
    refreshToken?: string;
}
export declare class AuthController {
    static login(req: Request, res: Response): Promise<void>;
    static refreshToken(req: Request, res: Response): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static logout(req: AuthenticatedRequest, res: Response): Promise<void>;
    static validateToken(req: AuthenticatedRequest, res: Response): Promise<void>;
}
