import { Router } from 'express'
import {
  getMe,
  loginUser,
  registerUser,
} from '../controllers/authController.js'
import { protect } from '../services/authGuards.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

export default router
