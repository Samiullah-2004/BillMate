import 'dotenv/config'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') })

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import clientRoutes from './routes/clientRoutes'
import invoiceRoutes from './routes/invoiceRoutes'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'BillMate API is running 🚀' })
})

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/invoices', invoiceRoutes)

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`JWT: ${process.env.JWT_SECRET ? 'Loaded' : 'MISSING'}`)
  console.log(`DB: ${process.env.DATABASE_URL ? 'Loaded' : 'MISSING'}`)
})

export default app