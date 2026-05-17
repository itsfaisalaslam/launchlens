import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401)
      throw new Error('Not authorized, token missing')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      res.status(401)
      throw new Error('Not authorized, user not found')
    }

    req.user = user
    next()
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(401)
    }

    next(error)
  }
}

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403)
    return next(new Error('Access denied. Admins only'))
  }

  next()
}
