const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTableStructure() {
  try {
    console.log('🔄 Verificando estructura de la tabla usuarios...');
    
    // Verificar columnas existentes
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas existentes en la tabla usuarios:');
    console.table(result.rows);
    
    // Verificar si existen datos en la tabla
    const countResult = await pool.query('SELECT COUNT(*) FROM usuarios');
    console.log(`📊 Total de registros: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();