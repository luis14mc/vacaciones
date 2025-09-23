import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/validate', authenticateToken, AuthController.validateToken);

export default router;