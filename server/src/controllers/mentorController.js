import asyncHandler from '../services/asyncHandler.js'
import Report from '../models/Report.js'
import { generateMentorReply } from '../services/mentorService.js'

export const mentorChat = asyncHandler(async (req, res) => {
  const { message, reportId } = req.body

  if (!message || !message.trim()) {
    res.status(400)
    throw new Error('Message is required')
  }

  let report = null

  if (reportId) {
    report = await Report.findById(reportId).populate(
      'ideaId',
      'title industry targetAudience',
    )

    if (!report) {
      res.status(404)
      throw new Error('Report not found')
    }

    if (report.userId.toString() !== req.user._id.toString()) {
      res.status(403)
      throw new Error('You are not allowed to use this report as mentor context')
    }
  }

  const reply = generateMentorReply({
    message: message.trim(),
    report,
  })

  res.status(200).json({
    success: true,
    reply,
  })
})
