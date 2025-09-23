import { Request, Response } from 'express';
export interface ConfiguracionSistema {
    id: number;
    clave: string;
    valor: string;
    descripcion?: string;
    categoria: string;
    fecha_actualizacion: string;
}
export interface UpdateConfigRequest {
    valor: string;
}
export interface ConfiguracionVacaciones {
    dias_maximos_por_solicitud: number;
    dias_minimos_anticipo: number;
    dias_anuales_empleado: number;
    permite_fraccionamiento: boolean;
    requiere_aprobacion_jefe: boolean;
    notificaciones_email: boolean;
}
export declare const getAllConfiguraciones: (req: Request, res: Response) => Promise<void>;
export declare const getConfiguracionByClave: (req: Request, res: Response) => Promise<void>;
export declare const updateConfiguracion: (req: Request, res: Response) => Promise<void>;
export declare const getConfiguracionVacaciones: (req: Request, res: Response) => Promise<void>;
export declare const updateConfiguracionVacaciones: (req: Request, res: Response) => Promise<void>;
export declare const resetConfiguracionDefecto: (req: Request, res: Response) => Promise<void>;
export declare const getHistorialConfiguracion: (req: Request, res: Response) => Promise<void>;
