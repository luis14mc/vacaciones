import { Request, Response } from 'express';
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserStats: (req: Request, res: Response) => Promise<void>;
export declare const toggleUserStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPotentialManagers: (req: Request, res: Response) => Promise<void>;
