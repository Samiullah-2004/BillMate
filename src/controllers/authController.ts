import { Request, Response } from 'express'
import { AuthRequest } from '../types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    console.log('User created:', user.id)
    console.log('JWT_SECRET at sign time:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING')

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    console.log('Token created successfully')

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('REGISTER ERROR:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req: AuthRequest , res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}