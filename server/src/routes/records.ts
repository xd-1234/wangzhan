import express from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../lib/auth'

const router = express.Router()

// Get all borrow records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { studentId, bookId, status } = req.query

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (bookId) where.bookId = bookId
    if (status === 'active') where.returnDate = null
    if (status === 'returned') where.returnDate = { not: null }

    const records = await prisma.borrowRecord.findMany({
      where,
      include: {
        student: {
          include: {
            class: true
          }
        },
        book: true
      },
      orderBy: {
        borrowDate: 'desc'
      }
    })

    res.json(records)
  } catch (error) {
    console.error('Get records error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Return a book
router.post('/:id/return', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const record = await prisma.borrowRecord.findUnique({
      where: { id },
      include: {
        book: true,
        student: true
      }
    })

    if (!record) {
      return res.status(404).json({ error: 'Borrow record not found' })
    }

    if (record.returnDate) {
      return res.status(400).json({ error: 'Book already returned' })
    }

    // Update record and book status in transaction
    await prisma.$transaction(async (tx) => {
      // Update return date
      await tx.borrowRecord.update({
        where: { id },
        data: { returnDate: new Date() }
      })

      // Update book status
      await tx.book.update({
        where: { id: record.bookId },
        data: {
          status: 'available',
          currentBorrowerStudentId: null
        }
      })
    })

    const updatedRecord = await prisma.borrowRecord.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true
          }
        },
        book: true
      }
    })

    res.json(updatedRecord)
  } catch (error) {
    console.error('Return book error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router