import { Router } from 'express'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController'
import { protect } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validate'
import { invoiceSchema, invoiceUpdateSchema } from '../schemas'

const router = Router()

router.use(protect)

router.get('/', getInvoices)
router.get('/:id', getInvoiceById)
router.post('/', validate(invoiceSchema), createInvoice)
router.put('/:id', validate(invoiceUpdateSchema), updateInvoice)
router.delete('/:id', deleteInvoice)

export default router