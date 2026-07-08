import express from "express";
import rateLimit from "express-rate-limit";

import aiController from "../controller/aiController.js";
import protect from '../middleware/authMiddleware.js';
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router()

// 30 requests per 15 minutes
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { message: 'Too many AI requests, please try again later' },
});

router.use(aiLimiter)

router.post('/valuate', protect, aiController.valuateProperty);
router.post('/describe', protect, aiController.describeProperty);
router.post('/match', protect, aiController.matchProperties);
router.post('/extract-clauses', protect, aiController.extractClauses);
router.post('/embed-property/:id', protect, aiController.embedProperty);
router.post('/embed-all', protect, allowRoles('admin'), aiController.embedAllProperties);
router.post('/generate-agreement', protect, aiController.generateAgreement);
router.post('/chat', protect, aiController.chat);

export default router