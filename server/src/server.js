import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import ideaRoutes from './routes/ideaRoutes.js'
import mentorRoutes from './routes/mentorRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import connectDB from './services/dbService.js'
import { errorHandler, notFound } from './services/errorHandlers.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://launchlens-beta.vercel.app',
      'https://launchlens-gahp88ae1-itsfaisalaslams-projects.vercel.app',
    ],
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Startup Validator API',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ideas', ideaRoutes)
app.use('/api/mentor', mentorRoutes)
app.use('/api/reports', reportRoutes)

app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectDB()
  } catch (error) {
    console.warn(
      `MongoDB connection skipped during startup: ${error.message}`,
    )
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()
