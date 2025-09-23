"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configController_1 = require("../controllers/configController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', configController_1.getAllConfiguraciones);
router.get('/categorias', configController_1.getCategorias);
router.post('/batch', configController_1.getConfiguracionesBatch);
router.get('/categoria/:categoria', configController_1.getConfiguracionesByCategoria);
router.get('/:clave', configController_1.getConfiguracionByClave);
router.post('/', configController_1.createConfiguracion);
router.put('/:clave', configController_1.updateConfiguracion);
router.delete('/:clave', configController_1.deleteConfiguracion);
exports.default = router;
//# sourceMappingURL=config.js.map