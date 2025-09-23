import { Request, Response } from 'express';
export type TipoConfiguracion = 'string' | 'number' | 'boolean' | 'json';
export interface Configuracion {
    id: number;
    clave: string;
    valor: string;
    tipo: TipoConfiguracion;
    descripcion?: string;
    categoria: string;
    es_editable: boolean;
    fecha_creacion: string;
    fecha_actualizacion: string;
}
export interface CreateConfiguracionRequest {
    clave: string;
    valor: string;
    tipo: TipoConfiguracion;
    descripcion?: string;
    categoria?: string;
    es_editable?: boolean;
}
export interface UpdateConfiguracionRequest {
    valor?: string;
    descripcion?: string;
    categoria?: string;
    es_editable?: boolean;
}
export declare const getAllConfiguraciones: (req: Request, res: Response) => Promise<void>;
export declare const getConfiguracionByClave: (req: Request, res: Response) => Promise<void>;
export declare const createConfiguracion: (req: Request, res: Response) => Promise<void>;
export declare const updateConfiguracion: (req: Request, res: Response) => Promise<void>;
export declare const deleteConfiguracion: (req: Request, res: Response) => Promise<void>;
export declare const getConfiguracionesByCategoria: (req: Request, res: Response) => Promise<void>;
export declare const getCategorias: (req: Request, res: Response) => Promise<void>;
export declare const getConfigValue: (clave: string) => Promise<any>;
export declare const getConfiguracionesBatch: (req: Request, res: Response) => Promise<void>;
