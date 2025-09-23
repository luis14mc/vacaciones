import { Request, Response } from 'express';
export interface ReporteSolicitudes {
    periodo: string;
    total_solicitudes: number;
    aprobadas: number;
    rechazadas: number;
    pendientes: number;
    dias_totales: number;
}
export interface ReportePorDepartamento {
    departamento: string;
    total_empleados: number;
    solicitudes_pendientes: number;
    solicitudes_aprobadas: number;
    dias_usados: number;
    dias_disponibles: number;
}
export interface ReporteUsuario {
    usuario_id: number;
    nombre: string;
    apellido: string;
    departamento: string;
    dias_disponibles: number;
    dias_usados: number;
    solicitudes_pendientes: number;
    solicitudes_aprobadas: number;
    ultima_solicitud?: string;
}
export declare const getReporteSolicitudes: (req: Request, res: Response) => Promise<void>;
export declare const getReportePorDepartamento: (req: Request, res: Response) => Promise<void>;
export declare const getReporteUsuarios: (req: Request, res: Response) => Promise<void>;
export declare const getEstadisticasGenerales: (req: Request, res: Response) => Promise<void>;
export declare const exportarReporte: (req: Request, res: Response) => Promise<void>;
