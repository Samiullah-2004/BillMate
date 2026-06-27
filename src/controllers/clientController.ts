import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../types'

// GET /api/clients
export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(clients)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/clients/:id
export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const client = await prisma.client.findFirst({
      where: { id: Number(id), userId: req.userId }
    })

    if (!client) {
      res.status(404).json({ message: 'Client not found' })
      return
    }

    res.json(client)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/clients
export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, company, phone } = req.body

  if (!name || !email) {
    res.status(400).json({ message: 'Name and email are required' })
    return
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        company,
        phone,
        userId: req.userId as number
      }
    })

    res.status(201).json(client)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/clients/:id
export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { name, email, company, phone } = req.body

  try {
    const existing = await prisma.client.findFirst({
      where: { id: Number(id), userId: req.userId }
    })

    if (!existing) {
      res.status(404).json({ message: 'Client not found' })
      return
    }

    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: { name, email, company, phone }
    })

    res.json(client)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/clients/:id
export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const existing = await prisma.client.findFirst({
      where: { id: Number(id), userId: req.userId }
    })

    if (!existing) {
      res.status(404).json({ message: 'Client not found' })
      return
    }

    await prisma.client.delete({ where: { id: Number(id) } })

    res.json({ message: 'Client deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ message: 'Cannot delete client with existing invoices' })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}