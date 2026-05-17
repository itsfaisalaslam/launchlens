import { Router } from 'express'
import { compareReports, getReportById } from '../controllers/reportController.js'
import { protect } from '../services/authGuards.js'

const router = Router()

router.get('/compare', protect, compareReports)
router.get('/:id', protect, getReportById)

export default router
