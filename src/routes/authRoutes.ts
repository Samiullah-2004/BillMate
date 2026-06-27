import { Router } from 'express'
import { register, login, getMe } from '../controllers/authController'
import { protect } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validate'
import { registerSchema, loginSchema } from '../schemas'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.get('/me', protect, getMe)

export default router