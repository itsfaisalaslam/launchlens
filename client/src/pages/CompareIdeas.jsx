import { useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'
import { resolveFinancialModel } from '../utils/financialModel.js'

const metricRows = [
  { label: 'Idea Title', key: 'ideaTitle', compareType: 'text' },
  { label: 'Industry', key: 'industry', compareType: 'text' },
  { label: 'Target Audience', key: 'targetAudience', compareType: 'text' },
  { label: 'Overall Score', key: 'overallScore', compareType: 'higher' },
  { label: 'Market Opportunity', key: 'marketOpportunity', compareType: 'higher' },
  { label: 'Problem Urgency', key: 'problemUrgency', compareType: 'higher' },
  {
    label: 'Target Audience Clarity',
    key: 'targetAudienceClarity',
    compareType: 'higher',
  },
  { label: 'Revenue Potential', key: 'revenuePotential', compareType: 'higher' },
  { label: 'Competition Risk', key: 'competitionRisk', compareType: 'lower' },
  { label: 'Execution Difficulty', key: 'executionDifficulty', compareType: 'lower' },
  { label: 'Scalability', key: 'scalability', compareType: 'higher' },
  { label: 'Innovation Level', key: 'innovationLevel', compareType: 'higher' },
  { label: 'Student/Founder Fit', key: 'founderFit', compareType: 'higher' },
  {
    label: 'Initial Investment',
    key: 'initialInvestment',
    compareType: 'lower',
    format: 'currency',
  },
  {
    label: 'Monthly Cost',
    key: 'monthlyCost',
    compareType: 'lower',
    format: 'currency',
  },
  {
    label: 'Expected Monthly Revenue',
    key: 'expectedRevenue',
    compareType: 'higher',
    format: 'currency',
  },
  { label: 'Break-even Months', key: 'breakEvenMonths', compareType: 'lower' },
  {
    label: 'Yearly Profit',
    key: 'yearlyProfit',
    compareType: 'higher',
    format: 'currency',
  },
  {
    label: 'ROI Percentage',
    key: 'roiPercentage',
    compareType: 'higher',
    format: 'percent',
  },
  { label: 'Risk Level', key: 'riskLevel', compareType: 'risk' },
]

const highDemandIndustries = [
  'ai',
  'edtech',
  'health',
  'healthcare',
  'fintech',
  'saas',
  'climate',
  'logistics',
  'productivity',
  'cybersecurity',
]

const monetizationKeywords = [
  'subscription',
  'freemium',
  'commission',
  'marketplace',
  'license',
  'licensing',
  'b2b',
  'enterprise',
  'pricing',
  'revenue',
  'paid',
  'membership',
]

const urgencyKeywords = [
  'delay',
  'manual',
  'slow',
  'expensive',
  'inefficient',
  'dropout',
  'waste',
  'stress',
  'urgent',
  'lack',
  'difficulty',
  'problem',
  'pain',
]

const innovationKeywords = [
  'ai',
  'automation',
  'predictive',
  'personalized',
  'real-time',
  'intelligent',
  'adaptive',
  'recommendation',
  'matching',
  'analytics',
]

const scaleKeywords = [
  'platform',
  'software',
  'digital',
  'api',
  'cloud',
  'self-serve',
  'multi-tenant',
  'automation',
  'dashboard',
  'marketplace',
]

const difficultKeywords = [
  'hardware',
  'manufacturing',
  'iot',
  'robot',
  'biotech',
  'medical device',
  'blockchain',
  'drone',
  'regulation',
  'compliance',
]

const vagueAudienceTokens = [
  'everyone',
  'all users',
  'all people',
  'general public',
  'anyone',
]

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const roundScore = (value) => Math.round(clamp(value, 0, 100))

const countMatches = (text, keywords) =>
  keywords.reduce(
    (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
    0,
  )

const scoreByLength = (text, minLength, maxLength, maxScore) => {
  const length = String(text || '').trim().length

  if (length <= minLength) {
    return 0
  }

  if (length >= maxLength) {
    return maxScore
  }

  return Math.round(((length - minLength) / (maxLength - minLength)) * maxScore)
}

const toArrayText = (value) => (Array.isArray(value) ? value.join(' ') : String(value || ''))

const buildReportText = (report) =>
  normalizeText(
    [
      report.ideaTitle,
      report.description,
      report.industry,
      report.targetAudience,
      report.marketAnalysis,
      report.competitorOverview,
      report.riskAssessment,
      report.pitchDeck?.problem,
      report.pitchDeck?.solution,
      report.pitchDeck?.targetMarket,
      report.pitchDeck?.businessModel,
      report.pitchDeck?.competition,
      report.pitchDeck?.financialSummary,
      toArrayText(report.pitchDeck?.roadmap),
      toArrayText(report.businessModel?.customerSegments),
      toArrayText(report.businessModel?.valueProposition),
      toArrayText(report.businessModel?.channels),
      toArrayText(report.businessModel?.revenueStreams),
      toArrayText(report.businessModel?.costStructure),
      toArrayText(report.swot?.strengths),
      toArrayText(report.swot?.weaknesses),
      toArrayText(report.swot?.opportunities),
      toArrayText(report.swot?.threats),
      toArrayText(report.suggestions),
    ].join(' '),
  )

const metricSummary = [
  { key: 'marketOpportunity', label: 'market opportunity', preferred: 'higher' },
  { key: 'problemUrgency', label: 'problem urgency', preferred: 'higher' },
  {
    key: 'targetAudienceClarity',
    label: 'target audience clarity',
    preferred: 'higher',
  },
  { key: 'revenuePotential', label: 'revenue potential', preferred: 'higher' },
  { key: 'competitionRisk', label: 'competition risk', preferred: 'lower' },
  { key: 'executionDifficulty', label: 'execution difficulty', preferred: 'lower' },
  { key: 'scalability', label: 'scalability', preferred: 'higher' },
  { key: 'innovationLevel', label: 'innovation level', preferred: 'higher' },
  { key: 'founderFit', label: 'student/founder fit', preferred: 'higher' },
]

const analyzeReport = (report) => {
  const text = buildReportText(report)
  const description = normalizeText(report.description)
  const audience = normalizeText(report.targetAudience)
  const industry = normalizeText(report.industry)
  const problemText = normalizeText(
    `${report.description} ${report.pitchDeck?.problem || ''} ${report.marketAnalysis || ''}`,
  )
  const solutionText = normalizeText(
    `${report.pitchDeck?.solution || ''} ${toArrayText(report.businessModel?.valueProposition)}`,
  )
  const revenueText = normalizeText(
    `${report.pitchDeck?.businessModel || ''} ${toArrayText(report.businessModel?.revenueStreams)} ${report.pitchDeck?.financialSummary || ''}`,
  )
  const competitionText = normalizeText(
    `${report.competitorOverview || ''} ${report.pitchDeck?.competition || ''} ${toArrayText(report.swot?.threats)}`,
  )
  const marketText = normalizeText(
    `${report.marketAnalysis || ''} ${report.pitchDeck?.targetMarket || ''} ${toArrayText(report.swot?.opportunities)}`,
  )
  const financialProjection = report.financialProjection || {}
  const dimensionScores = report.dimensionScores || {}
  const detailDepth =
    scoreByLength(description, 40, 320, 24) +
    scoreByLength(solutionText, 20, 180, 12) +
    scoreByLength(marketText, 20, 180, 12) +
    clamp(countMatches(text, monetizationKeywords) * 2, 0, 10) +
    clamp(countMatches(problemText, urgencyKeywords) * 2, 0, 10)
  const audienceSpecificity =
    scoreByLength(audience, 8, 70, 40) +
    clamp(audience.split(' ').filter(Boolean).length * 4, 0, 24) -
    (vagueAudienceTokens.some((token) => audience.includes(token)) ? 18 : 0)
  const industryDemand =
    52 +
    (highDemandIndustries.some((keyword) => industry.includes(keyword)) ? 14 : 0) +
    clamp(countMatches(marketText, ['growing', 'demand', 'market', 'users', 'adoption']) * 3, 0, 15)
  const marketOpportunity = roundScore(
    clamp(
      26 +
        detailDepth * 0.28 +
        audienceSpecificity * 0.14 +
        industryDemand * 0.34 +
        (dimensionScores.marketOpportunity || 0) * 0.24,
      35,
      95,
    ),
  )
  const problemUrgency = roundScore(
    clamp(
      24 +
        scoreByLength(problemText, 40, 260, 28) +
        countMatches(problemText, urgencyKeywords) * 5 +
        countMatches(problemText, ['time', 'cost', 'dropout', 'access', 'manual']) * 3,
      35,
      94,
    ),
  )
  const targetAudienceClarity = roundScore(
    clamp(28 + audienceSpecificity * 0.75 + scoreByLength(marketText, 20, 160, 18), 35, 96),
  )
  const preliminaryDifficulty = roundScore(
    clamp(
      38 +
        countMatches(text, difficultKeywords) * 7 +
        countMatches(text, ['delivery', 'inventory', 'logistics', 'hardware']) * 4 -
        countMatches(text, ['mvp', 'pilot', 'dashboard', 'web app', 'automation']) * 3,
      24,
      88,
    ),
  )
  const financials = resolveFinancialModel({
    ...report,
    title: report.ideaTitle,
    revenueModel:
      report.pitchDeck?.businessModel ||
      toArrayText(report.businessModel?.revenueStreams),
    score: report.overallScore,
  })
  const expectedRevenue = financials.expectedRevenue
  const monthlyCost = financials.monthlyCost
  const initialInvestment = financials.initialInvestment
  const yearlyProfit = financials.yearlyProfit
  const breakEvenMonths = financials.breakEvenMonths
  const marginRatio =
    expectedRevenue > 0
      ? clamp((expectedRevenue - monthlyCost) / expectedRevenue, -0.2, 0.8)
      : 0
  const revenueMultiple =
    monthlyCost > 0 ? clamp(expectedRevenue / monthlyCost, 0, 4) : expectedRevenue > 0 ? 1.5 : 0
  const revenuePotential = roundScore(
    clamp(
      28 +
        (dimensionScores.financialViability || 0) * 0.24 +
        scoreByLength(revenueText, 20, 180, 14) +
        clamp(revenueMultiple * 12, 0, 22) +
        clamp(marginRatio * 26, -8, 18) +
        (breakEvenMonths > 0 ? clamp(16 - breakEvenMonths, -8, 12) : 0),
      35,
      95,
    ),
  )
  const competitionRisk = roundScore(
    clamp(
      72 -
        (dimensionScores.uniqueness || 0) * 0.2 -
        countMatches(text, innovationKeywords) * 4 +
        countMatches(competitionText, ['crowded', 'saturated', 'many', 'strong', 'dominant']) * 4 +
        (audienceSpecificity < 35 ? 8 : 0),
      24,
      92,
    ),
  )
  const executionDifficulty = roundScore(
    clamp(
      42 +
        countMatches(text, difficultKeywords) * 7 +
        (initialInvestment > 1000000 ? 12 : initialInvestment > 300000 ? 6 : 0) +
        (breakEvenMonths > 18 ? 10 : breakEvenMonths > 12 ? 5 : 0) -
        countMatches(text, ['mvp', 'pilot', 'dashboard', 'web app', 'automation']) * 3,
      22,
      90,
    ),
  )
  const scalability = roundScore(
    clamp(
      30 +
        (dimensionScores.scalability || 0) * 0.28 +
        countMatches(text, scaleKeywords) * 5 +
        (audienceSpecificity > 45 ? 8 : 0) +
        (expectedRevenue > 0 ? 8 : 0),
      35,
      96,
    ),
  )
  const innovationLevel = roundScore(
    clamp(
      28 +
        (dimensionScores.uniqueness || 0) * 0.3 +
        countMatches(text, innovationKeywords) * 5 +
        scoreByLength(solutionText, 20, 160, 12),
      35,
      95,
    ),
  )
  const founderFit = roundScore(
    clamp(
      34 +
        (detailDepth > 45 ? 12 : 0) +
        (executionDifficulty < 55 ? 14 : executionDifficulty < 68 ? 7 : -4) +
        (initialInvestment > 0 && initialInvestment < 500000 ? 10 : initialInvestment <= 0 ? 0 : -6) +
        (industry.includes('edtech') || industry.includes('saas') || industry.includes('productivity')
          ? 8
          : 0) +
        (description.length > 120 ? 8 : 0),
      35,
      94,
    ),
  )

  const qualityPenalty =
    description.length < 90
      ? 12
      : description.length < 150
        ? 6
        : 0
  const clarityPenalty = audienceSpecificity < 32 ? 8 : 0
  const monetizationPenalty = revenuePotential < 52 ? 10 : 0

  const rawOverall =
    marketOpportunity * 0.16 +
    problemUrgency * 0.14 +
    targetAudienceClarity * 0.1 +
    revenuePotential * 0.14 +
    (100 - competitionRisk) * 0.11 +
    (100 - executionDifficulty) * 0.1 +
    scalability * 0.12 +
    innovationLevel * 0.08 +
    founderFit * 0.05

  const adjustedOverall = rawOverall - qualityPenalty - clarityPenalty - monetizationPenalty
  const weakIdea = description.length < 90 || targetAudienceClarity < 48 || problemUrgency < 52
  const strongIdea =
    adjustedOverall >= 78 &&
    marketOpportunity >= 75 &&
    revenuePotential >= 68 &&
    targetAudienceClarity >= 65 &&
    description.length >= 140
  const overallScore = roundScore(
    strongIdea
      ? clamp(adjustedOverall + 6, 80, 95)
      : weakIdea
        ? clamp(adjustedOverall - 6, 35, 59)
        : clamp(adjustedOverall, 60, 79),
  )

  const metrics = {
    marketOpportunity,
    problemUrgency,
    targetAudienceClarity,
    revenuePotential,
    competitionRisk,
    executionDifficulty,
    scalability,
    innovationLevel,
    founderFit,
    overallScore,
  }

  const rankedStrengths = [...metricSummary]
    .sort((first, second) => {
      const firstScore =
        first.preferred === 'lower' ? 100 - metrics[first.key] : metrics[first.key]
      const secondScore =
        second.preferred === 'lower' ? 100 - metrics[second.key] : metrics[second.key]
      return secondScore - firstScore
    })
    .slice(0, 3)
    .map((metric) => `${metric.label} (${metrics[metric.key]}/100)`)

  const rankedWeaknesses = [...metricSummary]
    .sort((first, second) => {
      const firstScore =
        first.preferred === 'lower' ? 100 - metrics[first.key] : metrics[first.key]
      const secondScore =
        second.preferred === 'lower' ? 100 - metrics[second.key] : metrics[second.key]
      return firstScore - secondScore
    })
    .slice(0, 3)
    .map((metric) => `${metric.label} (${metrics[metric.key]}/100)`)

  const swotStrengths = Array.isArray(report.swot?.strengths)
    ? report.swot.strengths.slice(0, 2)
    : []
  const swotWeaknesses = Array.isArray(report.swot?.weaknesses)
    ? report.swot.weaknesses.slice(0, 2)
    : []

  return {
    ...report,
    ...metrics,
    strengths: [...swotStrengths, ...rankedStrengths].slice(0, 4),
    weaknesses: [...swotWeaknesses, ...rankedWeaknesses].slice(0, 4),
    initialInvestment,
    monthlyCost,
    expectedRevenue,
    breakEvenMonths,
    yearlyProfit,
    roiPercentage: financials.roi,
    riskLevel: financials.riskLevel,
  }
}

function CompareIdeas() {
  const [ideas, setIdeas] = useState([])
  const [firstReportId, setFirstReportId] = useState('')
  const [secondReportId, setSecondReportId] = useState('')
  const [comparison, setComparison] = useState([])
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState('')

  const reports = useMemo(
    () => ideas.filter((idea) => idea.report).map((idea) => idea.report),
    [ideas],
  )

  const scoredComparison = useMemo(
    () => comparison.map((report) => analyzeReport(report)),
    [comparison],
  )

  const winner = useMemo(() => {
    if (scoredComparison.length !== 2) {
      return null
    }

    const [first, second] = scoredComparison

    if (first.overallScore === second.overallScore) {
      const firstTieBreaker =
        first.scalability + first.revenuePotential - first.competitionRisk
      const secondTieBreaker =
        second.scalability + second.revenuePotential - second.competitionRisk

      return firstTieBreaker >= secondTieBreaker ? first : second
    }

    return first.overallScore > second.overallScore ? first : second
  }, [scoredComparison])

  const finalRecommendation = useMemo(() => {
    if (scoredComparison.length !== 2 || !winner) {
      return ''
    }

    const runnerUp = scoredComparison.find(
      (report) => report.reportId !== winner.reportId,
    )
    const scoreGap = winner.overallScore - runnerUp.overallScore

    return `${winner.ideaTitle} is the stronger option right now because it shows better ${winner.marketOpportunity >= runnerUp.marketOpportunity ? 'market opportunity' : 'commercial structure'}, stronger ${winner.scalability >= runnerUp.scalability ? 'scalability' : 'founder fit'}, and a more convincing path to execution. ${runnerUp.ideaTitle} still has potential, but it needs sharper positioning around ${runnerUp.weaknesses[0]?.toLowerCase() || 'its weakest dimension'} before it becomes the better project to prioritize. The current score gap is ${scoreGap} points, which suggests ${scoreGap >= 8 ? 'a meaningful advantage' : 'a modest edge'} for ${winner.ideaTitle}.`
  }, [scoredComparison, winner])

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0)

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/ideas/my-ideas')
        setIdeas(data.ideas || [])
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            'Unable to load your reports for comparison.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [])

  const handleCompare = async () => {
    if (!firstReportId || !secondReportId) {
      setError('Please select two ideas to compare.')
      return
    }

    if (firstReportId === secondReportId) {
      setError('Please choose two different ideas.')
      return
    }

    setComparing(true)
    setError('')

    try {
      const { data } = await api.get(
        `/reports/compare?ids=${firstReportId},${secondReportId}`,
      )
      setComparison(data.comparison || [])
    } catch (compareError) {
      setError(
        compareError.response?.data?.message ||
          'Unable to compare the selected ideas right now.',
      )
    } finally {
      setComparing(false)
    }
  }

  const isBetterValue = (row, value, otherValue) => {
    if (row.compareType === 'text' || value === otherValue) {
      return false
    }

    if (row.compareType === 'higher') {
      return value > otherValue
    }

    if (row.compareType === 'lower') {
      return value < otherValue
    }

    if (row.compareType === 'risk') {
      const riskRank = { Low: 1, Medium: 2, High: 3 }
      return (riskRank[value] || 99) < (riskRank[otherValue] || 99)
    }

    return false
  }

  const renderCellValue = (row, value) => {
    if (row.format === 'currency') {
      return formatCurrency(value)
    }

    if (row.format === 'percent') {
      return `${value}%`
    }

    return value
  }

  return (
    <div className="page-shell space-y-8 py-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Compare Reports
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Side-by-side idea comparison
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Compare two Startup Validator reports to evaluate scoring, financial
          projections, and execution trade-offs before deciding which idea to
          pursue further.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-soft">
          Loading your reports...
        </div>
      ) : null}

      {!loading && reports.length < 2 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-emerald-50 p-8 text-center shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">
            Submit at least two ideas to compare.
          </h2>
          <p className="mt-3 text-slate-600">
            Once you have two analyzed reports, you can compare scores,
            financials, and strategic strengths side by side.
          </p>
        </div>
      ) : null}

      {!loading && reports.length >= 2 ? (
        <>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
              <div>
                <label
                  htmlFor="firstReport"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Select first idea
                </label>
                <select
                  id="firstReport"
                  value={firstReportId}
                  onChange={(event) => setFirstReportId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary"
                >
                  <option value="">Choose a report</option>
                  {ideas
                    .filter((idea) => idea.report)
                    .map((idea) => (
                      <option key={idea.report._id} value={idea.report._id}>
                        {idea.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="secondReport"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Select second idea
                </label>
                <select
                  id="secondReport"
                  value={secondReportId}
                  onChange={(event) => setSecondReportId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-primary"
                >
                  <option value="">Choose a report</option>
                  {ideas
                    .filter((idea) => idea.report)
                    .map((idea) => (
                      <option key={idea.report._id} value={idea.report._id}>
                        {idea.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCompare}
                  disabled={comparing}
                  className="inline-flex w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {comparing ? 'Comparing...' : 'Compare Ideas'}
                </button>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          {scoredComparison.length === 2 ? (
            <>
              <div className="grid gap-5 lg:grid-cols-2">
                {scoredComparison.map((report) => {
                  const isWinner = winner?.reportId === report.reportId

                  return (
                    <article
                      key={report.reportId}
                      className={`rounded-[2rem] border p-6 shadow-soft ${
                        isWinner
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {report.industry}
                          </p>
                          <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            {report.ideaTitle}
                          </h2>
                          <p className="mt-2 text-sm text-slate-600">
                            {report.targetAudience}
                          </p>
                        </div>
                        {isWinner ? (
                          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                            Winner
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-6 flex items-end justify-between rounded-[1.5rem] bg-slate-900 px-5 py-4 text-white">
                        <div>
                          <p className="text-sm text-slate-300">Overall Score</p>
                          <p className="mt-2 text-4xl font-bold">{report.overallScore}</p>
                        </div>
                        <div className="text-right text-sm text-slate-300">
                          <p>Scalability: {report.scalability}</p>
                          <p>Revenue: {report.revenuePotential}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Revenue
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {formatCurrency(report.expectedRevenue)}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            ROI
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {report.roiPercentage}%
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Risk
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {report.riskLevel}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            Strengths
                          </p>
                          <div className="mt-3 space-y-2">
                            {report.strengths.map((item) => (
                              <p key={item} className="text-sm text-slate-700">
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                            Weaknesses
                          </p>
                          <div className="mt-3 space-y-2">
                            {report.weaknesses.map((item) => (
                              <p key={item} className="text-sm text-slate-700">
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3 text-left">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Metric
                        </th>
                        {scoredComparison.map((report) => (
                          <th
                            key={report.reportId}
                            className="rounded-2xl bg-slate-50 px-4 py-4 text-left"
                          >
                            <p className="text-lg font-semibold text-slate-900">
                              {report.ideaTitle}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {report.industry}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metricRows.map((row) => {
                        const firstValue = scoredComparison[0][row.key]
                        const secondValue = scoredComparison[1][row.key]

                        return (
                          <tr key={row.label}>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                              {row.label}
                            </td>
                            {[firstValue, secondValue].map((value, index) => {
                              const otherValue = index === 0 ? secondValue : firstValue
                              const isBetter = isBetterValue(row, value, otherValue)

                              return (
                                <td
                                  key={`${row.label}-${index}`}
                                  className={`rounded-2xl border px-4 py-4 text-sm ${
                                    isBetter
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                      : 'border-slate-200 bg-white text-slate-700'
                                  }`}
                                >
                                  <span className={isBetter ? 'font-semibold' : ''}>
                                    {renderCellValue(row, value)}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Final Recommendation
                </p>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {finalRecommendation}
                </p>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default CompareIdeas
