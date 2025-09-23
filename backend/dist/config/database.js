"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryWithRetry = exports.connectDB = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
    statement_timeout: 30000,
    query_timeout: 30000,
});
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Conexión a PostgreSQL establecida correctamente");
        client.release();
    }
    catch (error) {
        console.error("❌ Error al conectar con PostgreSQL:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
pool.on('connect', () => {
    console.log('🔗 Nueva conexión establecida con la base de datos');
});
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de conexiones:', err);
});
pool.on('remove', () => {
    console.log('🗑️ Conexión removida del pool');
});
const queryWithRetry = async (text, params) => {
    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            return await pool.query(text, params);
        }
        catch (error) {
            retries++;
            console.error(`❌ Error en query (intento ${retries}/${maxRetries}):`, error.message);
            if (retries >= maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
    }
};
exports.queryWithRetry = queryWithRetry;
exports.default = pool;
//# sourceMappingURL=database.js.map