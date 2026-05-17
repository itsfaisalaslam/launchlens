import asyncHandler from '../services/asyncHandler.js'
import Idea from '../models/Idea.js'
import Report from '../models/Report.js'
import User from '../models/User.js'

export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalIdeas, totalReports, averageScoreResult] =
    await Promise.all([
      User.countDocuments(),
      Idea.countDocuments(),
      Report.countDocuments(),
      Report.aggregate([
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$overallScore' },
          },
        },
      ]),
    ])

  const averageScore = averageScoreResult[0]?.averageScore
    ? Number(averageScoreResult[0].averageScore.toFixed(1))
    : 0

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalIdeas,
      totalReports,
      averageScore,
    },
  })
})

export const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .lean()

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  })
})

export const getAdminIdeas = asyncHandler(async (req, res) => {
  const ideas = await Idea.find({})
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .lean()

  res.status(200).json({
    success: true,
    count: ideas.length,
    ideas,
  })
})
