import mongoose from 'mongoose'
import asyncHandler from '../services/asyncHandler.js'
import User from '../models/User.js'
import generateToken from '../services/generateToken.js'

const buildAuthResponse = (user) => ({
  success: true,
  message: 'Authentication successful',
  token: generateToken(user._id),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
})

export const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Name, email, and password are required')
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      res.status(409)
      throw new Error('User already exists with this email')
    }

    const user = await User.create({
      name,
      email,
      password,
    })

    res.status(201).json({
      ...buildAuthResponse(user),
      message: 'User registered successfully',
    })
  } catch (error) {
    console.error('Register error:', {
      message: error.message,
      stack: error.stack,
      readyState: mongoose.connection.readyState,
      email: req.body?.email,
    })
    throw error
  }
})

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  res.status(200).json({
    ...buildAuthResponse(user),
    message: 'Login successful',
  })
})

export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  })
})
