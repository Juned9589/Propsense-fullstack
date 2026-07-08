import express from "express";
import protect from "../middleware/authMiddleware.js";
import dealController from "../controller/dealController.js";
import upload, { uploadDocument } from "../middleware/imageUploadMiddleware.js";

const router = express.Router()

router.post('/', protect, dealController.createDeal)
router.get('/', protect, dealController.getDeals)
router.get('/:id', protect, dealController.getDealById)
router.get('/:id/timeline', protect, dealController.getDealTimeline)
router.put('/:id/status', protect, dealController.updateDealStatus)

router.put('/:id/offer', protect, dealController.updateOffer);
router.post('/:id/documents', protect, uploadDocument.single('file'), dealController.uploadDocument);
router.post('/:id/documents/:i/extract', protect, dealController.extractClauses);
router.delete('/:id/documents/:docId', protect, dealController.deleteDocument);
router.get('/:id/bundle', protect, dealController.downloadDealBundle);

export default router