import express from "express";
import notificationController from "../controller/notificationController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router()


router.get('/', protect, notificationController.getNotification);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

export default router