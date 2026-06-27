import { Router } from 'express'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController'
import { protect } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validate'
import { clientSchema, clientUpdateSchema } from '../schemas'

const router = Router()

router.use(protect)

router.get('/', getClients)
router.get('/:id', getClientById)
router.post('/', validate(clientSchema), createClient)
router.put('/:id', validate(clientUpdateSchema), updateClient)
router.delete('/:id', deleteClient)

export default router