import express from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../lib/auth'
import { generateBorrowPlan } from '../lib/planAlgorithm'

const router = express.Router()

// Create a new borrow plan
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { classId, studentIds, preferredCategories } = req.body

    if (!classId || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ 
        error: 'Class ID and student IDs array required' 
      })
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classExists) {
      return res.status(400).json({ error: 'Class not found' })
    }

    // Generate plan items using algorithm
    const planItems = await generateBorrowPlan({
      classId,
      studentIds,
      preferredCategories
    })

    if (planItems.length === 0) {
      return res.status(400).json({ error: 'No available books for the requested students' })
    }

    // Create the plan
    const plan = await prisma.borrowPlan.create({
      data: {
        classId,
        createdByUserId: req.user!.userId,
        items: {
          create: planItems
        }
      },
      include: {
        items: {
          include: {
            student: true,
            book: true
          }
        },
        class: true,
        createdBy: {
          select: {
            username: true,
            role: true
          }
        }
      }
    })

    res.status(201).json(plan)
  } catch (error) {
    console.error('Create plan error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get a specific plan
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const plan = await prisma.borrowPlan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            student: true,
            book: true
          }
        },
        class: true,
        createdBy: {
          select: {
            username: true,
            role: true
          }
        }
      }
    })

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' })
    }

    res.json(plan)
  } catch (error) {
    console.error('Get plan error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Execute a plan
router.post('/:id/execute', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const plan = await prisma.borrowPlan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            student: true,
            book: true
          }
        }
      }
    })

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' })
    }

    if (plan.status !== 'pending') {
      return res.status(400).json({ error: 'Plan is not pending' })
    }

    // Start transaction to execute the plan
    await prisma.$transaction(async (tx) => {
      // Create borrow records
      for (const item of plan.items) {
        await tx.borrowRecord.create({
          data: {
            studentId: item.studentId,
            bookId: item.bookId,
            planId: plan.id
          }
        })

        // Update book status
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            status: 'borrowed',
            currentBorrowerStudentId: item.studentId,
            timesBorrowed: { increment: 1 }
          }
        })
      }

      // Update plan status
      await tx.borrowPlan.update({
        where: { id },
        data: { status: 'executed' }
      })
    })

    const updatedPlan = await prisma.borrowPlan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            student: true,
            book: true
          }
        },
        class: true
      }
    })

    res.json(updatedPlan)
  } catch (error) {
    console.error('Execute plan error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Cancel a plan
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const plan = await prisma.borrowPlan.findUnique({
      where: { id }
    })

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' })
    }

    if (plan.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending plans can be canceled' })
    }

    const updatedPlan = await prisma.borrowPlan.update({
      where: { id },
      data: { status: 'canceled' },
      include: {
        items: {
          include: {
            student: true,
            book: true
          }
        },
        class: true
      }
    })

    res.json(updatedPlan)
  } catch (error) {
    console.error('Cancel plan error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router