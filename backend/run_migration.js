const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'database', 'add_numero_empleado.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Ejecutando migración para agregar numero_empleado...');
    
    // Ejecutar la migración
    await pool.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente');
    
    // Verificar que la columna fue agregada
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'numero_empleado'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Columna numero_empleado confirmada:', result.rows[0]);
    } else {
      console.log('❌ No se pudo confirmar la columna numero_empleado');
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
  } finally {
    await pool.end();
  }
}

runMigration();