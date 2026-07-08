import express from "express";
import dashboardController from "../controller/dashboardController.js";
import protect from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router()

router.get('/agent', protect, allowRoles('agent'), dashboardController.getAgentDashoard);
router.get('/admin', protect, allowRoles('admin'), dashboardController.getAdminDashboard);


export default router