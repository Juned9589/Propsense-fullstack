import express from 'express'
import propertyController from '../controller/propertyController.js';
import protect from '../middleware/authMiddleware.js'
import allowRoles from '../middleware/roleMiddleware.js';
import upload from '../middleware/imageUploadMiddleware.js'


const router = express.Router()

router.get('/', propertyController.getProperties)
router.get('/featured', propertyController.getFeaturedProperties)
router.get('/favorites', protect, propertyController.getFavorites)
router.get('/agent/my', protect, allowRoles('agent'), propertyController.getMyListings)
router.get('/similar/:id', propertyController.getSimilarProperties)
router.get('/:id', propertyController.getPropertybyId)


router.post('/', protect, allowRoles('agent', 'admin'), upload.array('images'), propertyController.createProperty)
router.put('/:id', protect, allowRoles('agent', 'admin'), upload.array('images'), propertyController.updateProperty)
router.post('/:id/images', protect, allowRoles('agent', 'admin'), upload.array('images'), propertyController.addImages)
router.delete('/:id/images/:imgId', protect, allowRoles('agent', 'admin'), propertyController.deleteImage)
router.post('/:id/favorite', protect, propertyController.toggleFavorite)
router.post('/:id/contact', protect, propertyController.contactAgent)
router.post('/:id/approve', protect, allowRoles('admin'), propertyController.togglePropertyApproval)
router.delete('/:id', protect, allowRoles('admin'), propertyController.deleteProperty)

export default router










