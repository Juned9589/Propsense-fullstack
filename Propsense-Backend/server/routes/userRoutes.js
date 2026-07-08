
import express from 'express';
import protect from '../middleware/authMiddleware.js'
import allowRoles from '../middleware/roleMiddleware.js';
import userController from '../controller/userController.js';
import upload from '../middleware/imageUploadMiddleware.js';

const router = express.Router()

router.put('/profile', protect, userController.updateProfile)
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar)
router.get('/agents', userController.getAgents)
router.get('/agents/:id', userController.getAgentById)
router.get('/', protect, allowRoles('admin'), userController.getAllUsers)
router.patch('/:id/role', protect, allowRoles('admin'), userController.updateUserRole)
router.patch('/:id/status', protect, allowRoles('admin'), userController.toggleUserStatus)
router.delete('/:id', protect, allowRoles('admin'), userController.deleteUser)



export default router