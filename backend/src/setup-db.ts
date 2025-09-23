import pool from './config/database';
import fs from 'fs';
import path from 'path';

const executeScript = async () => {
  try {
    console.log('🔄 Ejecutando script de inicialización de base de datos...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'init.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el script
    await pool.query(sqlScript);
    
    console.log('✅ Script de base de datos ejecutado exitosamente');
    console.log('📋 Tablas creadas:');
    console.log('   - usuarios');
    console.log('   - solicitudes_vacaciones'); 
    console.log('   - audit_logs');
    console.log('👤 Usuarios de ejemplo creados:');
    console.log('   - admin@cni.hn (admin123)');
    console.log('   - rrhh@cni.hn (admin123)');
    console.log('   - empleado@cni.hn (admin123)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando script de base de datos:', error);
    process.exit(1);
  }
};

executeScript();