import { Request, Response } from 'express';
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';
export interface SolicitudVacaciones {
    id: number;
    usuario_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    dias_solicitados: number;
    motivo?: string;
    estado: EstadoSolicitud;
    aprobado_por?: number;
    fecha_solicitud: string;
    fecha_respuesta?: string;
    comentarios?: string;
    usuario_nombre: string;
    usuario_apellido: string;
    usuario_departamento?: string;
    aprobador_nombre?: string;
}
export interface CreateSolicitudRequest {
    fecha_inicio: string;
    fecha_fin: string;
    motivo?: string;
}
export interface UpdateSolicitudRequest {
    estado: EstadoSolicitud;
    comentarios?: string;
}
export declare const getAllSolicitudes: (req: Request, res: Response) => Promise<void>;
export declare const getSolicitudById: (req: Request, res: Response) => Promise<void>;
export declare const createSolicitud: (req: Request, res: Response) => Promise<void>;
export declare const updateSolicitud: (req: Request, res: Response) => Promise<void>;
export declare const getSolicitudesStats: (req: Request, res: Response) => Promise<void>;
