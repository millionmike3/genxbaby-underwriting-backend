import { Router } from 'express'
import {
  createUnderwritingCase,
  runUnderwriting,
} from '../controllers/underwriting.controller'

const router = Router()

router.post('/case', createUnderwritingCase)
router.post('/run/:id', runUnderwriting)

export default router
