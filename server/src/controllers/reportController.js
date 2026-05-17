import asyncHandler from '../services/asyncHandler.js'
import mongoose from 'mongoose'
import Report from '../models/Report.js'

const normalizeFinancialProjection = (report) => {
  const financialProjection = report.financialProjection || {}
  const monthlyCost = financialProjection.monthlyCost || 0
  const expectedRevenue = financialProjection.expectedRevenue || 0
  const computedYearlyProfit =
    financialProjection.yearlyProfit ??
    Math.round((expectedRevenue - monthlyCost) * 12)

  return {
    ...report,
    financialProjection: {
      ...financialProjection,
      yearlyProfit: computedYearlyProfit,
    },
  }
}

const normalizePitchDeck = (report) => {
  const pitchDeck = report.pitchDeck || {}
  const title = report.ideaId?.title || 'This startup idea'
  const industry = report.ideaId?.industry || 'the target industry'
  const audience = report.ideaId?.targetAudience || 'its target audience'
  const financialProjection = report.financialProjection || {}

  return {
    ...report,
    pitchDeck: {
      problem:
        pitchDeck.problem ||
        `${audience} face recurring challenges in ${industry} and need a clearer, more efficient solution.`,
      solution:
        pitchDeck.solution ||
        `${title} delivers a focused product experience designed to solve that problem with greater clarity and usability.`,
      targetMarket:
        pitchDeck.targetMarket ||
        `The primary target market includes ${audience}, with room for expansion into related segments.`,
      businessModel:
        pitchDeck.businessModel ||
        'The business can grow through subscriptions, premium feature access, and strategic partnerships.',
      competition:
        pitchDeck.competition ||
        `Competition exists in ${industry}, but stronger positioning and execution can help this idea stand out.`,
      financialSummary:
        pitchDeck.financialSummary ||
        `Estimated initial investment is INR ${financialProjection.initialInvestment || 0}, with expected revenue and cost structure supporting future profitability.`,
      roadmap:
        pitchDeck.roadmap?.length
          ? pitchDeck.roadmap
          : [
              'Validate the problem with target users.',
              'Build a lean MVP.',
              'Launch a pilot and refine using feedback.',
            ],
    },
  }
}

const normalizeInvestorInsights = (report) => {
  const investorInsights = report.investorInsights || {}
  const financialProjection = report.financialProjection || {}
  const fallbackFundingRequired =
    financialProjection.initialInvestment > 0
      ? Math.round(financialProjection.initialInvestment * 1.5)
      : 0
  const fallbackRoi =
    financialProjection.initialInvestment > 0
      ? Math.max(
          10,
          Math.round(
            ((financialProjection.yearlyProfit || 0) /
              financialProjection.initialInvestment) *
              100,
          ),
        )
      : 0

  return {
    ...report,
    investorInsights: {
      fundingRequired:
        investorInsights.fundingRequired ?? fallbackFundingRequired,
      roiEstimate: investorInsights.roiEstimate ?? fallbackRoi,
      riskLevel: investorInsights.riskLevel || 'Medium',
      growthPotential: investorInsights.growthPotential || 'Medium',
    },
  }
}

export const compareReports = asyncHandler(async (req, res) => {
  const idsParam = req.query.ids

  if (!idsParam) {
    res.status(400)
    throw new Error('Missing ids query parameter')
  }

  const reportIds = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (reportIds.length !== 2) {
    res.status(400)
    throw new Error('Please provide exactly 2 report IDs')
  }

  const hasInvalidId = reportIds.some((id) => !mongoose.Types.ObjectId.isValid(id))

  if (hasInvalidId) {
    res.status(400)
    throw new Error('One or more report IDs are invalid')
  }

  const reports = await Report.find({ _id: { $in: reportIds } })
    .populate('ideaId', 'title industry targetAudience description')
    .lean()

  if (reports.length !== 2) {
    res.status(404)
    throw new Error('One or more reports were not found')
  }

  const unauthorizedReport = reports.find(
    (report) => report.userId.toString() !== req.user._id.toString(),
  )

  if (unauthorizedReport) {
    res.status(403)
    throw new Error('You are not allowed to compare these reports')
  }

  const orderedReports = reportIds.map((id) =>
    reports.find((report) => report._id.toString() === id),
  )

  const comparison = orderedReports.map((report) => {
    const normalizedReport = normalizeInvestorInsights(
      normalizePitchDeck(normalizeFinancialProjection(report)),
    )

    return {
      reportId: report._id,
      ideaTitle: report.ideaId?.title || 'Unknown Idea',
      industry: report.ideaId?.industry || 'Unknown Industry',
      targetAudience: report.ideaId?.targetAudience || '',
      description: report.ideaId?.description || '',
      overallScore: report.overallScore,
      dimensionScores: report.dimensionScores,
      marketAnalysis: normalizedReport.marketAnalysis || '',
      competitorOverview: normalizedReport.competitorOverview || '',
      riskAssessment: normalizedReport.riskAssessment || '',
      suggestions: normalizedReport.suggestions || [],
      swot: normalizedReport.swot || {},
      businessModel: normalizedReport.businessModel || {},
      financialProjection: normalizedReport.financialProjection,
      pitchDeck: normalizedReport.pitchDeck || {},
      investorInsights: normalizedReport.investorInsights || {},
      breakEvenMonths:
        normalizedReport.financialProjection?.breakEvenMonths || 0,
      yearlyProfit: normalizedReport.financialProjection?.yearlyProfit || 0,
    }
  })

  res.status(200).json({
    success: true,
    comparison,
  })
})

export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id || req.params.reportId)
    .populate('ideaId', 'title industry targetAudience')

  if (!report) {
    res.status(404)
    throw new Error('Report not found')
  }

  if (report.userId.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('You are not allowed to view this report')
  }

  res.status(200).json({
    success: true,
    report: normalizeInvestorInsights(
      normalizePitchDeck(normalizeFinancialProjection(report.toObject())),
    ),
  })
})
