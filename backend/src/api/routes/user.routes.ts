import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/profile', authenticate, userController.getProfile)
router.patch('/profile', authenticate, userController.updateProfile)
router.get('/preferences', authenticate, userController.getPreferences)
router.patch('/preferences', authenticate, userController.updatePreferences)
router.get('/skills', authenticate, userController.getSkills)
router.patch('/skills', authenticate, userController.updateSkills)
router.delete('/account', authenticate, userController.deleteAccount)

export default router