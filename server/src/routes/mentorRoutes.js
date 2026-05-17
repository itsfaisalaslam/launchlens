import { Router } from 'express'
import { mentorChat } from '../controllers/mentorController.js'
import { protect } from '../services/authGuards.js'

const router = Router()

router.post('/chat', protect, mentorChat)

export default router
