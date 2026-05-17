import asyncHandler from '../services/asyncHandler.js'
import Idea from '../models/Idea.js'
import Report from '../models/Report.js'
import { analyzeStartupIdea } from '../services/aiAnalysisService.js'
import { validateStartupIdeaInput } from '../utils/validateStartupIdeaInput.js'

export const submitIdea = asyncHandler(async (req, res) => {
  const { title, description, industry, targetAudience } = req.body

  const validation = validateStartupIdeaInput(req.body)

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message })
  }

  const idea = await Idea.create({
    userId: req.user._id,
    title: title.trim(),
    description: description.trim(),
    industry: industry.trim(),
    targetAudience: targetAudience.trim(),
    status: 'pending',
  })

  const analysis = await analyzeStartupIdea({
    title,
    description,
    industry,
    targetAudience,
  })

  console.log(
    '[AI] Final analysis payload before save:',
    JSON.stringify(
      {
        aiText: analysis.aiText,
        marketAnalysis: analysis.marketAnalysis,
        competitorOverview: analysis.competitorOverview,
        riskAssessment: analysis.riskAssessment,
        suggestions: analysis.suggestions,
        businessModel: analysis.businessModel,
        pitchDeck: analysis.pitchDeck,
      },
      null,
      2,
    ),
  )

  const report = await Report.create({
    ideaId: idea._id,
    userId: req.user._id,
    ...analysis,
    aiAnalysis: analysis.aiAnalysis,
    marketAnalysis: analysis.marketAnalysis,
    competitorOverview: analysis.competitorOverview,
    riskAssessment: analysis.riskAssessment,
    suggestions: analysis.suggestions,
    businessModelCanvas: analysis.businessModelCanvas,
    pitchDeck: analysis.pitchDeck,
  })

  idea.status = 'analyzed'
  await idea.save()

  console.log('SAVED REPORT:', report)

  console.log(
    '[DB] Saved report:',
    JSON.stringify(
      {
        reportId: report._id,
        ideaId: report.ideaId,
        aiText: report.aiText,
        marketAnalysis: report.marketAnalysis,
        competitorOverview: report.competitorOverview,
        riskAssessment: report.riskAssessment,
        suggestions: report.suggestions,
        businessModel: report.businessModel,
        pitchDeck: report.pitchDeck,
      },
      null,
      2,
    ),
  )

  res.status(201).json({
    success: true,
    message: 'Idea submitted and analyzed successfully',
    idea,
    report,
  })
})

export const getMyIdeas = asyncHandler(async (req, res) => {
  const ideas = await Idea.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean()

  const reports = await Report.find({ userId: req.user._id })
    .select(
      [
        'ideaId',
        'overallScore',
        'dimensionScores',
        'createdAt',
        'aiAnalysis',
        'aiText',
        'marketAnalysis',
        'competitorOverview',
        'riskAssessment',
        'suggestions',
        'businessModel',
        'businessModelCanvas',
        'financialProjection',
        'investorInsights',
        'pitchDeck',
      ].join(' '),
    )
    .lean()

  const reportMap = new Map(
    reports.map((report) => [report.ideaId.toString(), report]),
  )

  const ideasWithReports = ideas.map((idea) => ({
    ...idea,
    report: reportMap.get(idea._id.toString()) || null,
  }))

  res.status(200).json({
    success: true,
    count: ideasWithReports.length,
    ideas: ideasWithReports,
  })
})
