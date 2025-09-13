import express from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../lib/auth'

const router = express.Router()

// Get all books
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category } = req.query

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    const books = await prisma.book.findMany({
      where,
      include: {
        records: {
          where: {
            returnDate: null // Current borrower
          },
          include: {
            student: {
              include: {
                class: true
              }
            }
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { title: 'asc' }
      ]
    })

    res.json(books)
  } catch (error) {
    console.error('Get books error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new book
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, author, category, location } = req.body

    if (!title || !author || !category || !location) {
      return res.status(400).json({ 
        error: 'Title, author, category, and location are required' 
      })
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        category,
        location
      }
    })

    res.status(201).json(book)
  } catch (error) {
    console.error('Create book error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router