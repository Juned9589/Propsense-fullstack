import express from 'express';
import protect from '../middleware/authMiddleware.js'
import authController from '../controller/authController.js'


const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', protect, authController.getme);
router.put('/preferences', protect, authController.savePreferences);
router.post('/forgot-password', authController.forgetPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.put('/change-password', protect, authController.changePassword);

export default router;