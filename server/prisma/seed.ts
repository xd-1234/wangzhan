import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'teacher'
    }
  })

  // Create a class
  const bClass = await prisma.class.create({
    data: {
      name: 'B班'
    }
  })

  // Create students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: '张三',
        classId: bClass.id
      }
    }),
    prisma.student.create({
      data: {
        name: '李四',
        classId: bClass.id
      }
    }),
    prisma.student.create({
      data: {
        name: '王五',
        classId: bClass.id
      }
    }),
    prisma.student.create({
      data: {
        name: '赵六',
        classId: bClass.id
      }
    }),
    prisma.student.create({
      data: {
        name: '钱七',
        classId: bClass.id
      }
    })
  ])

  // Create books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: '三国演义',
        author: '罗贯中',
        category: '古典文学',
        location: 'A1-001'
      }
    }),
    prisma.book.create({
      data: {
        title: '水浒传',
        author: '施耐庵',
        category: '古典文学',
        location: 'A1-002'
      }
    }),
    prisma.book.create({
      data: {
        title: '西游记',
        author: '吴承恩',
        category: '古典文学',
        location: 'A1-003'
      }
    }),
    prisma.book.create({
      data: {
        title: '红楼梦',
        author: '曹雪芹',
        category: '古典文学',
        location: 'A1-004'
      }
    }),
    prisma.book.create({
      data: {
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        category: '现代文学',
        location: 'B2-001'
      }
    }),
    prisma.book.create({
      data: {
        title: '1984',
        author: '乔治·奥威尔',
        category: '现代文学',
        location: 'B2-002'
      }
    }),
    prisma.book.create({
      data: {
        title: '平凡的世界',
        author: '路遥',
        category: '现代文学',
        location: 'B2-003'
      }
    }),
    prisma.book.create({
      data: {
        title: '围城',
        author: '钱钟书',
        category: '现代文学',
        location: 'B2-004'
      }
    })
  ])

  console.log('Seed data created successfully!')
  console.log(`Created:`)
  console.log(`- Admin user: admin/admin123`)
  console.log(`- Class: ${bClass.name}`)
  console.log(`- Students: ${students.length}`)
  console.log(`- Books: ${books.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })