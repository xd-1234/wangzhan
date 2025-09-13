import { prisma } from './prisma'

export interface BorrowPlanRequest {
  classId: string
  studentIds: string[]
  preferredCategories?: string[]
}

export interface PlanItem {
  studentId: string
  bookId: string
  isRepeat: boolean
}

export async function generateBorrowPlan(request: BorrowPlanRequest): Promise<PlanItem[]> {
  const { classId, studentIds, preferredCategories = [] } = request

  // Get available books
  let availableBooks = await prisma.book.findMany({
    where: {
      status: 'available',
      ...(preferredCategories.length > 0 && {
        category: { in: preferredCategories }
      })
    },
    orderBy: [
      { timesBorrowed: 'asc' }, // Prefer less borrowed books
      { createdAt: 'desc' }
    ]
  })

  // Get students' borrowing history to detect repeats
  const studentsHistory = await prisma.borrowRecord.findMany({
    where: {
      studentId: { in: studentIds },
      returnDate: { not: null } // Only completed borrows
    },
    select: {
      studentId: true,
      bookId: true
    }
  })

  // Create a map of student -> borrowed book IDs
  const studentBorrowHistory = new Map<string, Set<string>>()
  for (const record of studentsHistory) {
    if (!studentBorrowHistory.has(record.studentId)) {
      studentBorrowHistory.set(record.studentId, new Set())
    }
    studentBorrowHistory.get(record.studentId)!.add(record.bookId)
  }

  const planItems: PlanItem[] = []
  const usedBookIds = new Set<string>()

  // Try to assign a book to each student
  for (const studentId of studentIds) {
    const studentHistory = studentBorrowHistory.get(studentId) || new Set()
    
    // Find a book that this student hasn't borrowed before
    let assignedBook = availableBooks.find((book: any) => 
      !usedBookIds.has(book.id) && !studentHistory.has(book.id)
    )

    // If no new book available, allow repeat but mark it
    if (!assignedBook) {
      assignedBook = availableBooks.find((book: any) => !usedBookIds.has(book.id))
    }

    if (assignedBook) {
      const isRepeat = studentHistory.has(assignedBook.id)
      planItems.push({
        studentId,
        bookId: assignedBook.id,
        isRepeat
      })
      usedBookIds.add(assignedBook.id)
    }
  }

  return planItems
}