const industryProfiles = [
  {
    match: ['foodtech', 'food', 'delivery', 'restaurant', 'grocery', 'kitchen'],
    investmentRange: [200000, 600000],
    complexity: 0.82,
    scale: 0.72,
  },
  {
    match: ['ai', 'saas', 'software', 'automation', 'platform', 'productivity'],
    investmentRange: [50000, 200000],
    complexity: 0.38,
    scale: 0.94,
  },
  {
    match: ['edtech', 'education', 'learning', 'student', 'college'],
    investmentRange: [100000, 300000],
    complexity: 0.52,
    scale: 0.8,
  },
  {
    match: ['ecommerce', 'e commerce', 'inventory', 'retail', 'shopping'],
    investmentRange: [200000, 500000],
    complexity: 0.74,
    scale: 0.78,
  },
  {
    match: ['marketplace', 'vendor', 'seller', 'commission'],
    investmentRange: [150000, 350000],
    complexity: 0.62,
    scale: 0.86,
  },
]

const revenueModelKeywords = {
  subscription: ['subscription', 'saas', 'membership', 'recurring', 'freemium'],
  commission: ['commission', 'marketplace', 'transaction fee', 'vendor fee'],
  ecommerce: ['inventory', 'orders', 'cart', 'delivery', 'storefront'],
  enterprise: ['b2b', 'enterprise', 'institutions', 'schools', 'colleges', 'businesses'],
}

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const countMatches = (text, keywords) =>
  keywords.reduce(
    (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
    0,
  )

const roundToNearest = (value, step = 5000) => {
  if (!Number.isFinite(value) || value <= 0) {
    return step
  }

  return Math.max(step, Math.round(value / step) * step)
}

const createStableFactor = (text, min = 0.9, max = 1.1) => {
  const normalized = normalizeText(text)

  if (!normalized) {
    return 1
  }

  let hash = 0
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % 1000003
  }

  const ratio = (hash % 1000) / 1000
  return min + ratio * (max - min)
}

const getIndustryProfile = (text) =>
  industryProfiles.find((profile) =>
    profile.match.some((token) => text.includes(token)),
  ) || {
    investmentRange: [120000, 320000],
    complexity: 0.58,
    scale: 0.76,
  }

const inferRevenueModel = (explicitRevenueModel, text) => {
  const directModel = normalizeText(explicitRevenueModel)

  if (directModel) {
    return directModel
  }

  if (countMatches(text, revenueModelKeywords.subscription) > 0) {
    return 'subscription'
  }

  if (countMatches(text, revenueModelKeywords.commission) > 0) {
    return 'commission'
  }

  if (countMatches(text, revenueModelKeywords.ecommerce) > 0) {
    return 'ecommerce'
  }

  if (countMatches(text, revenueModelKeywords.enterprise) > 0) {
    return 'enterprise'
  }

  return 'generic'
}

const looksLikeLegacyFallback = (idea, financialProjection) => {
  const aiText = normalizeText(idea.aiText)
  const financialSummary = normalizeText(idea.pitchDeck?.financialSummary)

  if (
    aiText.includes('shows promising potential in the') &&
    financialSummary.includes('moderate startup cost with room for recurring revenue')
  ) {
    return true
  }

  return (
    Number(financialProjection?.initialInvestment || 0) > 0 &&
    Number(financialProjection?.monthlyCost || 0) > 0 &&
    Number(financialProjection?.expectedRevenue || 0) > 0 &&
    Number(financialProjection?.breakEvenMonths || 0) > 0 &&
    Number(financialProjection?.yearlyProfit || 0) > 0 &&
    normalizeText(idea.marketAnalysis).includes(
      'continues to create room for digital products',
    )
  )
}

const canUseProvidedFinancials = (idea) => {
  const financialProjection = idea.financialProjection || {}

  return (
    Number(financialProjection.initialInvestment || 0) > 0 &&
    Number(financialProjection.monthlyCost || 0) > 0 &&
    Number(financialProjection.expectedRevenue || 0) > 0 &&
    Number(financialProjection.breakEvenMonths || 0) > 0 &&
    Number(financialProjection.yearlyProfit || 0) !== 0 &&
    !looksLikeLegacyFallback(idea, financialProjection)
  )
}

const calculateRoi = (yearlyProfit, initialInvestment) => {
  if (initialInvestment <= 0) {
    return 0
  }

  return Math.round((yearlyProfit / initialInvestment) * 100)
}

const calculateRiskLevel = ({
  initialInvestment,
  monthlyCost,
  monthlyRevenue,
  breakEvenMonths,
  yearlyProfit,
}) => {
  if (monthlyRevenue < monthlyCost) {
    return 'Very High'
  }

  let riskScore = 0

  if (initialInvestment > 500000) {
    riskScore += 3
  } else if (initialInvestment > 300000) {
    riskScore += 2
  } else if (initialInvestment > 180000) {
    riskScore += 1
  }

  if (monthlyCost > 90000) {
    riskScore += 3
  } else if (monthlyCost > 50000) {
    riskScore += 2
  } else if (monthlyCost > 30000) {
    riskScore += 1
  }

  if (breakEvenMonths > 12) {
    riskScore += 3
  } else if (breakEvenMonths > 8) {
    riskScore += 1
  }

  if (yearlyProfit > initialInvestment * 0.9) {
    riskScore -= 2
  } else if (yearlyProfit > initialInvestment * 0.5) {
    riskScore -= 1
  }

  if (initialInvestment < 180000 && yearlyProfit > monthlyCost * 18) {
    riskScore -= 1
  }

  if (riskScore >= 6) {
    return 'High'
  }

  if (riskScore >= 3) {
    return 'Medium'
  }

  return 'Low'
}

export const createFinancialModel = (idea = {}) => {
  const title = normalizeText(idea.title || idea.ideaTitle)
  const industry = normalizeText(idea.industry)
  const description = normalizeText(idea.description || idea.problemStatement)
  const targetAudience = normalizeText(idea.targetAudience)
  const revenueModel = inferRevenueModel(
    idea.revenueModel ||
      idea.pitchDeck?.businessModel ||
      idea.businessModel?.revenueStreams?.join(' '),
    `${title} ${description} ${industry} ${targetAudience}`,
  )
  const text = `${title} ${industry} ${description} ${targetAudience} ${revenueModel}`
  const profile = getIndustryProfile(text)
  const seedFactor = createStableFactor(
    `${title} ${industry} ${targetAudience} ${revenueModel}`,
  )
  const descriptionStrength = clamp(description.length / 220, 0.15, 1)
  const audienceClarity = clamp(targetAudience.split(' ').filter(Boolean).length / 6, 0.2, 1)
  const marketSignal = clamp(
    countMatches(text, ['market', 'demand', 'growing', 'students', 'businesses', 'users']) / 6,
    0,
    1,
  )
  const executionDifficulty = clamp(
    profile.complexity +
      countMatches(text, ['delivery', 'inventory', 'hardware', 'logistics', 'compliance']) * 0.05 -
      countMatches(text, ['software', 'automation', 'dashboard', 'digital', 'mvp']) * 0.03,
    0.25,
    0.95,
  )
  const score =
    Number(idea.score ?? idea.overallScore ?? idea.ideaStrength ?? 0) ||
    Math.round(
      clamp(
        45 +
          descriptionStrength * 22 +
          audienceClarity * 12 +
          marketSignal * 10 +
          profile.scale * 8 -
          executionDifficulty * 10,
        35,
        92,
      ),
    )
  const [minimumInvestment, maximumInvestment] = profile.investmentRange
  const investmentProgress = clamp(
    0.2 + descriptionStrength * 0.3 + marketSignal * 0.2 + executionDifficulty * 0.3,
    0,
    1,
  )
  const initialInvestment = roundToNearest(
    (minimumInvestment + (maximumInvestment - minimumInvestment) * investmentProgress) *
      seedFactor,
  )
  const monthlyCostRatio = clamp(
    0.1 + executionDifficulty * 0.09 + (1 - profile.scale) * 0.05,
    0.1,
    0.25,
  )
  const monthlyCost = roundToNearest(initialInvestment * monthlyCostRatio)

  let revenueMultiplierRange = [0.95, 1.15]
  if (score >= 80) {
    revenueMultiplierRange = [2, 5]
  } else if (score >= 60) {
    revenueMultiplierRange = [1.2, 2]
  }

  const revenueBoost =
    marketSignal * 0.35 +
    descriptionStrength * 0.2 +
    audienceClarity * 0.15 +
    (revenueModel === 'subscription' || revenueModel === 'enterprise' ? 0.12 : 0) +
    (revenueModel === 'commission' ? 0.08 : 0) +
    profile.scale * 0.1
  const monthlyRevenueMultiplier =
    revenueMultiplierRange[0] +
    (revenueMultiplierRange[1] - revenueMultiplierRange[0]) *
      clamp(0.2 + revenueBoost, 0, 1)
  const monthlyRevenue = roundToNearest(
    monthlyCost * monthlyRevenueMultiplier * createStableFactor(text, 0.92, 1.08),
  )
  const monthlyProfit = Math.max(5000, monthlyRevenue - monthlyCost)
  const breakEvenMonths = Math.max(
    4,
    Math.min(36, Math.ceil(initialInvestment / monthlyProfit)),
  )
  const yearlyProfit = Math.round(monthlyProfit * 12)
  const roi = calculateRoi(yearlyProfit, initialInvestment)
  const riskLevel = calculateRiskLevel({
    initialInvestment,
    monthlyCost,
    monthlyRevenue,
    breakEvenMonths,
    yearlyProfit,
  })

  return {
    initialInvestment,
    monthlyCost,
    monthlyRevenue,
    expectedRevenue: monthlyRevenue,
    breakEvenMonths,
    yearlyProfit,
    roi,
    roiPercentage: roi,
    riskLevel,
  }
}

export const resolveFinancialModel = (idea = {}) => {
  if (canUseProvidedFinancials(idea)) {
    const financialProjection = idea.financialProjection || {}
    const monthlyRevenue = Number(
      financialProjection.monthlyRevenue || financialProjection.expectedRevenue || 0,
    )
    const yearlyProfit = Number(
      financialProjection.yearlyProfit ??
        (monthlyRevenue - Number(financialProjection.monthlyCost || 0)) * 12,
    )
    const initialInvestment = Number(financialProjection.initialInvestment || 0)
    const monthlyCost = Number(financialProjection.monthlyCost || 0)
    const breakEvenMonths = Number(financialProjection.breakEvenMonths || 0)
    const roi = calculateRoi(yearlyProfit, initialInvestment)
    const riskLevel = calculateRiskLevel({
      initialInvestment,
      monthlyCost,
      monthlyRevenue,
      breakEvenMonths,
      yearlyProfit,
    })

    return {
      initialInvestment,
      monthlyCost,
      monthlyRevenue,
      expectedRevenue: monthlyRevenue,
      breakEvenMonths,
      yearlyProfit,
      roi,
      roiPercentage: roi,
      riskLevel,
    }
  }

  return createFinancialModel(idea)
}
