import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../types'

interface InvoiceItemInput {
  description: string
  quantity: number
  unitPrice: number
}

// GET /api/invoices
export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(invoices)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/invoices/:id
export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: Number(id), userId: req.userId },
      include: { client: true, items: true }
    })

    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' })
      return
    }

    res.json(invoice)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/invoices
export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { clientId, dueDate, notes, tax, items } = req.body as {
    clientId: number
    dueDate: string
    notes?: string
    tax?: number
    items: InvoiceItemInput[]
  }

  if (!clientId || !dueDate || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'clientId, dueDate, and at least one item are required' })
    return
  }

  for (const item of items) {
    if (!item.description || item.quantity == null || item.unitPrice == null) {
      res.status(400).json({ message: 'Each item requires description, quantity, and unitPrice' })
      return
    }
  }

  try {
    // Verify the client belongs to this user
    const client = await prisma.client.findFirst({
      where: { id: Number(clientId), userId: req.userId }
    })

    if (!client) {
      res.status(404).json({ message: 'Client not found' })
      return
    }

    // Server-side calculation — never trust client-sent totals
    const computedItems = items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice
    }))

    const subtotal = computedItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = tax ?? 0
    const total = subtotal + taxAmount

 // Generate globally unique invoice number
const invoiceCount = await prisma.invoice.count()
const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: new Date(dueDate),
        notes,
        subtotal,
        tax: taxAmount,
        total,
        userId: req.userId as number,
        clientId: Number(clientId),
        items: {
          create: computedItems
        }
      },
      include: { client: true, items: true }
    })

    res.status(201).json(invoice)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/invoices/:id
export const updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { status, dueDate, notes } = req.body

  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: Number(id), userId: req.userId }
    })

    if (!existing) {
      res.status(404).json({ message: 'Invoice not found' })
      return
    }

    const invoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes
      },
      include: { client: true, items: true }
    })

    res.json(invoice)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/invoices/:id
export const deleteInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: Number(id), userId: req.userId }
    })

    if (!existing) {
      res.status(404).json({ message: 'Invoice not found' })
      return
    }

    // InvoiceItem rows cascade-delete automatically per schema
    await prisma.invoice.delete({ where: { id: Number(id) } })

    res.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}