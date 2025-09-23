import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Reducir el número máximo de conexiones
  idleTimeoutMillis: 10000, // Reducir timeout idle
  connectionTimeoutMillis: 5000, // Reducir timeout de conexión
  keepAlive: true, // Mantener conexiones vivas
  statement_timeout: 30000, // Timeout para statements
  query_timeout: 30000, // Timeout para queries
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("✅ Conexión a PostgreSQL establecida correctamente");
    client.release();
  } catch (error) {
    console.error("❌ Error al conectar con PostgreSQL:", error);
    process.exit(1);
  }
};

// Manejo de eventos del pool
pool.on('connect', () => {
  console.log('🔗 Nueva conexión establecida con la base de datos');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
});

pool.on('remove', () => {
  console.log('🗑️ Conexión removida del pool');
});

// Función para ejecutar queries con retry automático
export const queryWithRetry = async (text: string, params?: any[]): Promise<any> => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await pool.query(text, params);
    } catch (error: any) {
      retries++;
      console.error(`❌ Error en query (intento ${retries}/${maxRetries}):`, error.message);
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};

export default pool;
