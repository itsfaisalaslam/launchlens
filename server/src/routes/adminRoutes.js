import { Router } from 'express'
import {
  getAdminIdeas,
  getAdminStats,
  getAdminUsers,
} from '../controllers/adminController.js'
import { adminOnly, protect } from '../services/authGuards.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/stats', getAdminStats)
router.get('/users', getAdminUsers)
router.get('/ideas', getAdminIdeas)

export default router
