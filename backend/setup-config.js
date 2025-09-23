const { Pool } = require('pg');

// Usar la misma configuración que el backend
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_sM30cLDTukxg@ep-winter-silence-adbjhnvf-pooler.c-2.us-east-1.aws.neon.tech/cni_vacaciones?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupConfigurations() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuraciones (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'string',
        descripcion TEXT,
        categoria VARCHAR(100) DEFAULT 'general',
        es_editable BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabla configuraciones creada/verificada');
    
    // Insertar configuraciones básicas
    const configs = [
      ['dias_anticipacion_minimo', '7', 'number', 'Días mínimos de anticipación para solicitar vacaciones', 'politicas_solicitud'],
      ['dias_consecutivos_maximo', '15', 'number', 'Máximo de días consecutivos permitidos en una solicitud', 'politicas_solicitud'],
      ['dias_consecutivos_minimo', '1', 'number', 'Mínimo de días por solicitud', 'politicas_solicitud'],
      ['permitir_inicio_fin_semana', 'false', 'boolean', 'Permitir que las vacaciones inicien en fin de semana', 'politicas_solicitud'],
      ['permitir_dias_festivos', 'true', 'boolean', 'Permitir solicitar días festivos como vacaciones', 'politicas_solicitud'],
      ['max_solicitudes_pendientes', '3', 'number', 'Máximo de solicitudes pendientes por empleado', 'limites_sistema'],
      ['permitir_solicitudes_retroactivas', 'false', 'boolean', 'Permitir solicitudes con fechas pasadas', 'limites_sistema'],
      ['requiere_aprobacion_jefe', 'true', 'boolean', 'Las solicitudes requieren aprobación del jefe inmediato', 'flujo_aprobacion'],
      ['requiere_aprobacion_rrhh', 'true', 'boolean', 'Las solicitudes requieren aprobación final de RRHH', 'flujo_aprobacion'],
      ['auto_aprobar_menos_dias', '0', 'number', 'Auto-aprobar solicitudes de X días o menos (0 = deshabilitado)', 'flujo_aprobacion']
    ];
    
    for (const [clave, valor, tipo, descripcion, categoria] of configs) {
      try {
        await pool.query(`
          INSERT INTO configuraciones (clave, valor, tipo, descripcion, categoria, es_editable)
          VALUES ($1, $2, $3, $4, $5, true)
          ON CONFLICT (clave) DO NOTHING
        `, [clave, valor, tipo, descripcion, categoria]);
      } catch (err) {
        console.log(`⚠️ Configuración ${clave} ya existe o error:`, err.message);
      }
    }
    
    // Verificar resultado
    const result = await pool.query('SELECT COUNT(*) as total FROM configuraciones');
    console.log(`🎉 Total configuraciones: ${result.rows[0].total}`);
    
    // Mostrar categorías
    const categories = await pool.query(`
      SELECT categoria, COUNT(*) as total 
      FROM configuraciones 
      GROUP BY categoria 
      ORDER BY categoria
    `);
    
    console.log('📂 Categorías creadas:');
    categories.rows.forEach(cat => {
      console.log(`   - ${cat.categoria}: ${cat.total} configuraciones`);
    });
    
    await pool.end();
    console.log('✅ Configuración completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupConfigurations();