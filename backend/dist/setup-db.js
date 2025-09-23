"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const executeScript = async () => {
    try {
        console.log('🔄 Ejecutando script de inicialización de base de datos...');
        const sqlPath = path_1.default.join(__dirname, '..', 'database', 'init.sql');
        const sqlScript = fs_1.default.readFileSync(sqlPath, 'utf8');
        await database_1.default.query(sqlScript);
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
    }
    catch (error) {
        console.error('❌ Error ejecutando script de base de datos:', error);
        process.exit(1);
    }
};
executeScript();
//# sourceMappingURL=setup-db.js.map