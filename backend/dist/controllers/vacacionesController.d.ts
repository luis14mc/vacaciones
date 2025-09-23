import { Request, Response } from 'express';
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';
export interface SolicitudVacaciones {
    id: number;
    usuario_id: number;
    fecha_inicio: string;
    fecha_fin: string;
    dias_solicitados: number;
    motivo: string;
    comentarios?: string;
    estado: EstadoSolicitud;
    aprobador_jefe_id?: number;
    fecha_aprobacion_jefe?: string;
    comentarios_jefe?: string;
    aprobador_rrhh_id?: number;
    fecha_aprobacion_rrhh?: string;
    comentarios_rrhh?: string;
    fecha_rechazo?: string;
    motivo_rechazo?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    usuario_nombre?: string;
    usuario_apellido?: string;
    usuario_numero_empleado?: string;
    jefe_nombre?: string;
    rrhh_nombre?: string;
}
export interface CreateSolicitudRequest {
    fecha_inicio: string;
    fecha_fin: string;
    motivo?: string;
    comentarios?: string;
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
export declare const approveByJefe: (req: Request, res: Response) => Promise<void>;
export declare const rejectByJefe: (req: Request, res: Response) => Promise<void>;
export declare const approveByRRHH: (req: Request, res: Response) => Promise<void>;
export declare const rejectByRRHH: (req: Request, res: Response) => Promise<void>;
