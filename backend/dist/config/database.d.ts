import { Pool } from "pg";
declare const pool: Pool;
export declare const connectDB: () => Promise<void>;
export declare const queryWithRetry: (text: string, params?: any[]) => Promise<any>;
export default pool;
