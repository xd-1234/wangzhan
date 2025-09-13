import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

// Import routes
import authRoutes from './routes/auth'
import studentRoutes from './routes/students'
import bookRoutes from './routes/books'
import planRoutes from './routes/plans'
import recordRoutes from './routes/records'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('combined'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/auth', authRoutes)
app.use('/students', studentRoutes)
app.use('/books', bookRoutes)
app.use('/borrow-plans', planRoutes)
app.use('/borrow-records', recordRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log('  GET  /health')
  console.log('  POST /auth/login')
  console.log('  GET  /students')
  console.log('  POST /students')
  console.log('  GET  /books')
  console.log('  POST /books')
  console.log('  POST /borrow-plans')
  console.log('  GET  /borrow-plans/:id')
  console.log('  POST /borrow-plans/:id/execute')
  console.log('  POST /borrow-plans/:id/cancel')
  console.log('  GET  /borrow-records')
  console.log('  POST /borrow-records/:id/return')
})

export default app