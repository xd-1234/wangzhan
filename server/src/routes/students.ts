import express from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../lib/auth'

const router = express.Router()

// Get all students
router.get('/', authMiddleware, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: true,
        records: {
          where: {
            returnDate: null // Currently borrowed books
          },
          include: {
            book: true
          }
        }
      },
      orderBy: [
        { class: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    res.json(students)
  } catch (error) {
    console.error('Get students error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new student
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, classId } = req.body

    if (!name || !classId) {
      return res.status(400).json({ error: 'Name and class ID required' })
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classExists) {
      return res.status(400).json({ error: 'Class not found' })
    }

    const student = await prisma.student.create({
      data: {
        name,
        classId
      },
      include: {
        class: true
      }
    })

    res.status(201).json(student)
  } catch (error) {
    console.error('Create student error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router