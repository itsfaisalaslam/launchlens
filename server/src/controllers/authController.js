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
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email, and password are required')
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
