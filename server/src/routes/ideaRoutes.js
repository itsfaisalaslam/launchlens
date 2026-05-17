import { Router } from 'express'
import { getMyIdeas, submitIdea } from '../controllers/ideaController.js'
import { protect } from '../services/authGuards.js'

const router = Router()

router.post('/submit', protect, submitIdea)
router.get('/my-ideas', protect, getMyIdeas)

export default router
