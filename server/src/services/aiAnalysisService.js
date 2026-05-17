import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_MODEL = 'gemini-1.5-flash-latest'
const AI_FAILURE_MESSAGE =
  'AI service is temporarily unavailable. Please try again after some time.'
const FALLBACK_MODEL = 'gemini-1.5-flash'

const clampScore = (value) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)))
}

const ensureString = (value) => {
  return typeof value === 'string' ? value.trim() : ''
}

const ensureStringArray = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

const ensureTextList = (value) => {
  if (Array.isArray(value)) {
    return ensureStringArray(value)
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,;|]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const ensureNumber = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? Math.round(numericValue) : 0
}

const normalizeText = (value) => {
  return ensureString(String(value || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const countMatches = (text, keywords) => {
  return keywords.reduce(
    (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
    0,
  )
}

const roundToNearest = (value, step = 5000) => {
  if (!Number.isFinite(value) || value <= 0) {
    return step
  }

  return Math.max(step, Math.round(value / step) * step)
}

const createStableFactor = (text, min = 0.93, max = 1.07) => {
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

const financialProfiles = [
  {
    keywords: ['saas', 'software', 'ai', 'automation', 'platform', 'productivity'],
    initial: 140000,
    monthly: 28000,
    revenue: 95000,
  },
  {
    keywords: ['food', 'delivery', 'restaurant', 'kitchen', 'grocery'],
    initial: 460000,
    monthly: 110000,
    revenue: 170000,
  },
  {
    keywords: ['edtech', 'education', 'student', 'learning', 'college'],
    initial: 220000,
    monthly: 42000,
    revenue: 90000,
  },
  {
    keywords: ['marketplace', 'commission', 'vendor', 'seller'],
    initial: 320000,
    monthly: 70000,
    revenue: 130000,
  },
  {
    keywords: ['ecommerce', 'e commerce', 'inventory', 'retail', 'shopping'],
    initial: 390000,
    monthly: 85000,
    revenue: 155000,
  },
]

const getFinancialProfile = (text) => {
  return (
    financialProfiles.find((profile) =>
      profile.keywords.some((keyword) => text.includes(keyword)),
    ) || {
      initial: 240000,
      monthly: 48000,
      revenue: 100000,
    }
  )
}

const estimateFallbackFinancials = (ideaData) => {
  const title = ensureString(ideaData?.title)
  const description = ensureString(ideaData?.description)
  const industry = ensureString(ideaData?.industry)
  const targetAudience = ensureString(ideaData?.targetAudience)
  const text = normalizeText(
    `${title} ${description} ${industry} ${targetAudience}`,
  )
  const profile = getFinancialProfile(text)
  const seedFactor = createStableFactor(`${title} ${targetAudience}`)
  const complexitySignal =
    countMatches(text, [
      'hardware',
      'logistics',
      'inventory',
      'delivery',
      'manufacturing',
      'iot',
      'compliance',
      'regulation',
    ]) * 0.12
  const scaleSignal =
    countMatches(text, [
      'ai',
      'platform',
      'subscription',
      'automation',
      'cloud',
      'software',
      'dashboard',
      'digital',
    ]) * 0.08
  const monetizationSignal =
    countMatches(text, [
      'subscription',
      'commission',
      'freemium',
      'pricing',
      'membership',
      'b2b',
      'enterprise',
      'paid',
    ]) * 0.07
  const demandSignal =
    countMatches(text, [
      'students',
      'schools',
      'businesses',
      'smb',
      'professionals',
      'growing',
      'demand',
      'market',
    ]) * 0.06
  const claritySignal = Math.min(description.length / 220, 1) * 0.18

  const initialInvestment = roundToNearest(
    profile.initial *
      seedFactor *
      (0.92 + complexitySignal + demandSignal + Math.max(0.02, claritySignal - scaleSignal * 0.3)),
  )
  const monthlyCost = roundToNearest(
    profile.monthly *
      seedFactor *
      (0.9 + complexitySignal + Math.max(0, demandSignal * 0.6) + (text.includes('delivery') ? 0.22 : 0)),
  )
  const expectedRevenue = roundToNearest(
    profile.revenue *
      seedFactor *
      (0.85 + monetizationSignal + demandSignal + scaleSignal + claritySignal),
  )
  const monthlyProfit = Math.max(
    8000,
    Math.round(expectedRevenue - monthlyCost),
  )
  const breakEvenMonths = Math.max(
    6,
    Math.min(28, Math.ceil(initialInvestment / monthlyProfit)),
  )
  const yearlyProfit = Math.round(monthlyProfit * 12)
  const roiEstimate = Math.max(
    8,
    Math.min(95, Math.round((yearlyProfit / initialInvestment) * 100)),
  )
  const riskScore =
    42 +
    complexitySignal * 120 -
    scaleSignal * 35 -
    monetizationSignal * 20 +
    (breakEvenMonths > 18 ? 18 : breakEvenMonths > 12 ? 8 : 0)
  const riskLevel = riskScore >= 62 ? 'High' : riskScore >= 46 ? 'Medium' : 'Low'
  const growthPotential =
    scaleSignal + demandSignal + monetizationSignal >= 0.5 ? 'High' : 'Medium'

  return {
    financialProjection: {
      initialInvestment,
      monthlyCost,
      expectedRevenue,
      breakEvenMonths,
      yearlyProfit,
    },
    investorInsights: {
      fundingRequired: roundToNearest(initialInvestment * 1.45),
      roiEstimate,
      riskLevel,
      growthPotential,
    },
  }
}

const createAiFailure = (message = AI_FAILURE_MESSAGE) => {
  const error = new Error(message)
  error.isAIResponseError = true
  return error
}

const buildFallbackAiText = (ideaData, analysis = {}) => {
  const title = ensureString(ideaData?.title) || 'This startup idea'
  const industry = ensureString(ideaData?.industry) || 'its target industry'
  const targetAudience =
    ensureString(ideaData?.targetAudience) || 'the intended audience'

  return (
    ensureString(analysis.aiText) ||
    [
      `${title} has been reviewed for feasibility in ${industry}.`,
      ensureString(analysis.marketAnalysis) ||
        `The idea targets ${targetAudience} and needs stronger market validation.`,
      ensureString(analysis.riskAssessment) ||
        'Analysis could not be generated, please try again.',
    ]
      .filter(Boolean)
      .join(' ')
  )
}

const applyAnalysisFallbacks = (ideaData, analysis = {}) => {
  const title = ensureString(ideaData?.title) || 'This startup idea'
  const industry = ensureString(ideaData?.industry) || 'startup'
  const description =
    ensureString(ideaData?.description) || 'a recurring user problem'
  const targetAudience =
    ensureString(ideaData?.targetAudience) || 'target users'
  const problemSummary =
    description.length > 160 ? `${description.slice(0, 157)}...` : description
  const businessModel = analysis.businessModel || {}
  const pitchDeck = analysis.pitchDeck || {}
  const fallbackBusinessModel = {
    customerSegments:
      ensureTextList(businessModel.customerSegments).length > 0
        ? ensureTextList(businessModel.customerSegments)
        : [targetAudience, `Organizations operating in ${industry}`],
    valueProposition:
      ensureTextList(businessModel.valueProposition).length > 0
        ? ensureTextList(businessModel.valueProposition)
        : [
            `Solves a clear problem for ${targetAudience}`,
            `Improves efficiency and decision-making in ${industry}`,
          ],
    channels:
      ensureTextList(businessModel.channels).length > 0
        ? ensureTextList(businessModel.channels)
        : ['Web platform', 'Direct outreach', 'Partnerships'],
    revenueStreams:
      ensureTextList(businessModel.revenueStreams).length > 0
        ? ensureTextList(businessModel.revenueStreams)
        : ['Subscription revenue', 'Institutional partnerships'],
    costStructure:
      ensureTextList(businessModel.costStructure).length > 0
        ? ensureTextList(businessModel.costStructure)
        : ['Product development', 'Marketing', 'Operations'],
  }
  const fallbackPitchDeck = {
    problem:
      ensureString(pitchDeck.problem) ||
      `Users in ${industry} face issues related to ${problemSummary}.`,
    solution:
      ensureString(pitchDeck.solution) ||
      `${title} provides a focused solution by simplifying the workflow and improving the user experience.`,
    targetMarket:
      ensureString(pitchDeck.targetMarket) ||
      `${targetAudience} within the ${industry} market.`,
    businessModel:
      ensureString(pitchDeck.businessModel) ||
      `The business can monetize through ${fallbackBusinessModel.revenueStreams.join(' and ')}.`,
    competition:
      ensureString(pitchDeck.competition) ||
      `The competitive advantage depends on sharper positioning, better execution, and a stronger value proposition for ${targetAudience}.`,
    financialSummary:
      ensureString(pitchDeck.financialSummary) ||
      `This idea requires staged investment, cost control, and early validation to become viable in ${industry}.`,
    roadmap:
      ensureStringArray(pitchDeck.roadmap).length > 0
        ? ensureStringArray(pitchDeck.roadmap)
        : [
            'Validate the problem with target users.',
            'Build a lean MVP and test adoption.',
            'Refine the offer using feedback and traction data.',
          ],
  }

  return {
    ...analysis,
    aiAnalysis: buildFallbackAiText(ideaData, analysis),
    aiText: buildFallbackAiText(ideaData, analysis),
    marketAnalysis:
      ensureString(analysis.marketAnalysis) ||
      `Analysis could not be generated, please try again. The ${industry} opportunity still needs validation with ${targetAudience}.`,
    competitorOverview:
      ensureString(analysis.competitorOverview) ||
      'Analysis could not be generated, please try again. Competitor positioning should be reviewed manually.',
    riskAssessment:
      ensureString(analysis.riskAssessment) ||
      'Analysis could not be generated, please try again.',
    suggestions:
      ensureStringArray(analysis.suggestions).length > 0
        ? ensureStringArray(analysis.suggestions)
        : ['Analysis could not be generated, please try again.'],
    businessModel: fallbackBusinessModel,
    businessModelCanvas: fallbackBusinessModel,
    pitchDeck: fallbackPitchDeck,
  }
}

const buildFallbackAnalysis = (ideaData) => {
  const industry = ensureString(ideaData?.industry) || 'startup'
  const title = ensureString(ideaData?.title) || 'This startup idea'
  const targetAudience =
    ensureString(ideaData?.targetAudience) || 'early-stage users'
  const description = ensureString(ideaData?.description)
  const text = normalizeText(
    `${title} ${description} ${industry} ${targetAudience}`,
  )
  const detailScore = Math.min(24, Math.round(description.length / 10))
  const demandScore = countMatches(text, [
    'ai',
    'automation',
    'student',
    'health',
    'finance',
    'small business',
    'market',
    'demand',
    'efficiency',
  ])
  const uniquenessScore = countMatches(text, [
    'personalized',
    'matching',
    'predictive',
    'real time',
    'assistant',
    'recommendation',
    'analytics',
  ])
  const complexityScore = countMatches(text, [
    'hardware',
    'delivery',
    'inventory',
    'logistics',
    'compliance',
    'regulation',
  ])
  const fallbackFinancials = estimateFallbackFinancials(ideaData)
  const financialQuality =
    fallbackFinancials.investorInsights.roiEstimate >= 35 ? 14 : 8

  return applyAnalysisFallbacks(ideaData, {
    aiText: `${title} shows promising potential in the ${industry} space, especially if the product focuses on solving a clear user problem for ${targetAudience}.`,
    overallScore: Math.max(
      52,
      Math.min(
        88,
        52 + detailScore + demandScore * 2 + uniquenessScore * 2 - complexityScore,
      ),
    ),
    dimensionScores: {
      marketOpportunity: Math.max(
        48,
        Math.min(90, 54 + detailScore + demandScore * 3),
      ),
      uniqueness: Math.max(
        45,
        Math.min(88, 50 + uniquenessScore * 4 + detailScore * 0.4),
      ),
      scalability: Math.max(
        46,
        Math.min(
          90,
          52 +
            countMatches(text, ['platform', 'software', 'subscription', 'ai']) *
              5 +
            detailScore * 0.5,
        ),
      ),
      financialViability: Math.max(
        44,
        Math.min(88, 50 + financialQuality + demandScore * 2),
      ),
      executionComplexity: Math.max(
        32,
        Math.min(84, 42 + complexityScore * 6 + (description.length < 110 ? 8 : 0)),
      ),
    },
    marketAnalysis: `The ${industry} market continues to create room for digital products that solve clear problems with measurable value.`,
    competitorOverview:
      'Competition is likely to come from existing digital tools and startups offering similar value, so differentiation will be important.',
    riskAssessment:
      'Main risks include competition, positioning clarity, and early user acquisition challenges.',
    suggestions: [
      'Focus on a sharper value proposition and simple onboarding flow.',
      'Validate demand early through feedback from real target users.',
      'Strengthen differentiation with a clear product advantage or niche.',
    ],
    swot: {
      strengths: [
        'Idea aligns with a real-world user problem.',
        'Potential for digital delivery and iteration.',
      ],
      weaknesses: [
        'Positioning may need further refinement.',
        'Execution success depends on user adoption strategy.',
      ],
      opportunities: [
        `Growing interest in ${industry} innovation.`,
        'Potential partnerships can improve reach and credibility.',
      ],
      threats: [
        'Established competitors may already serve adjacent use cases.',
        'Customer acquisition costs may rise without a focused go-to-market plan.',
      ],
    },
    businessModel: {
      customerSegments: [targetAudience, 'Institutions or organizations in the same space'],
      valueProposition: [
        'Solves a specific user pain point with a digital-first approach.',
        'Can improve efficiency, decision quality, or user experience.',
      ],
      channels: ['Web platform', 'Direct outreach and partnerships'],
      revenueStreams: ['Subscription plans', 'Institutional or B2B partnerships'],
      costStructure: ['Product development', 'Marketing and customer acquisition'],
    },
    financialProjection: fallbackFinancials.financialProjection,
    investorInsights: fallbackFinancials.investorInsights,
    pitchDeck: {
      problem:
        'Users still face friction in solving this problem efficiently with current available solutions.',
      solution:
        'A focused digital platform that simplifies the experience and adds intelligent personalization.',
      targetMarket: `${industry} users, especially ${targetAudience}.`,
      businessModel:
        'Recurring subscription with potential partnership-led distribution.',
      competition:
        'Competes with existing digital tools, manual alternatives, and niche startups.',
      financialSummary:
        'Moderate startup cost with room for recurring revenue and scalable growth if adoption is validated.',
      roadmap: [
        'Build MVP and test with target users.',
        'Refine positioning and launch acquisition experiments.',
        'Scale product and partnerships based on usage data.',
      ],
    },
  })
}

const extractStatusCode = (error) => {
  return (
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.cause?.status ||
    error?.cause?.statusCode ||
    null
  )
}

const extractShortErrorMessage = (error) => {
  const rawMessage =
    error?.message ||
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    'Unknown AI service error'

  return ensureString(String(rawMessage)).slice(0, 180) || 'Unknown AI service error'
}

const logGeminiFailure = (modelName, error) => {
  const statusCode = extractStatusCode(error) || 'unknown'
  const shortMessage = extractShortErrorMessage(error)
  console.error(
    `[AI] Gemini request failed | model=${modelName} | status=${statusCode} | message=${shortMessage}`,
  )
}

const cleanGeminiJsonText = (text) => {
  const trimmedText = ensureString(text)

  if (!trimmedText) {
    console.error('Gemini raw response: <empty>')
    throw createAiFailure()
  }

  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedMatch?.[1]?.trim() || trimmedText
  const firstBrace = candidate.indexOf('{')
  const lastBrace = candidate.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
    console.error('Gemini raw response:', trimmedText)
    throw createAiFailure()
  }

  return candidate.slice(firstBrace, lastBrace + 1)
}

const parseGeminiJson = (rawText) => {
  const cleanedText = cleanGeminiJsonText(rawText)

  try {
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('Gemini raw response:', rawText)
    console.error('Gemini JSON parse error:', error)
    throw createAiFailure()
  }
}

const validateAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== 'object') {
    throw createAiFailure()
  }

  const businessModelSource =
    analysis.businessModelCanvas || analysis.businessModel || {}
  const pitchDeckSource = analysis.pitchDeck || {}

  return {
    aiAnalysis: ensureString(analysis.aiAnalysis || analysis.aiText),
    aiText: ensureString(analysis.aiText),
    overallScore: clampScore(analysis.overallScore),
    dimensionScores: {
      marketOpportunity: clampScore(
        analysis.dimensionScores?.marketOpportunity,
      ),
      uniqueness: clampScore(analysis.dimensionScores?.uniqueness),
      scalability: clampScore(analysis.dimensionScores?.scalability),
      financialViability: clampScore(
        analysis.dimensionScores?.financialViability,
      ),
      executionComplexity: clampScore(
        analysis.dimensionScores?.executionComplexity,
      ),
    },
    marketAnalysis: ensureString(analysis.marketAnalysis),
    competitorOverview: ensureString(analysis.competitorOverview),
    riskAssessment: ensureString(analysis.riskAssessment),
    suggestions: ensureStringArray(analysis.suggestions),
    swot: {
      strengths: ensureStringArray(analysis.swot?.strengths),
      weaknesses: ensureStringArray(analysis.swot?.weaknesses),
      opportunities: ensureStringArray(analysis.swot?.opportunities),
      threats: ensureStringArray(analysis.swot?.threats),
    },
    businessModel: {
      customerSegments: ensureTextList(
        businessModelSource.customerSegments,
      ),
      valueProposition: ensureTextList(
        businessModelSource.valueProposition,
      ),
      channels: ensureTextList(businessModelSource.channels),
      revenueStreams: ensureTextList(
        businessModelSource.revenueStreams,
      ),
      costStructure: ensureTextList(businessModelSource.costStructure),
    },
    businessModelCanvas: {
      customerSegments: ensureTextList(
        businessModelSource.customerSegments,
      ),
      valueProposition: ensureTextList(
        businessModelSource.valueProposition,
      ),
      channels: ensureTextList(businessModelSource.channels),
      revenueStreams: ensureTextList(
        businessModelSource.revenueStreams,
      ),
      costStructure: ensureTextList(businessModelSource.costStructure),
    },
    financialProjection: {
      initialInvestment: ensureNumber(
        analysis.financialProjection?.initialInvestment,
      ),
      monthlyCost: ensureNumber(analysis.financialProjection?.monthlyCost),
      expectedRevenue: ensureNumber(
        analysis.financialProjection?.expectedRevenue,
      ),
      breakEvenMonths: ensureNumber(
        analysis.financialProjection?.breakEvenMonths,
      ),
      yearlyProfit: ensureNumber(analysis.financialProjection?.yearlyProfit),
    },
    investorInsights: {
      fundingRequired: ensureNumber(analysis.investorInsights?.fundingRequired),
      roiEstimate: ensureNumber(analysis.investorInsights?.roiEstimate),
      riskLevel: ['Low', 'Medium', 'High'].includes(
        analysis.investorInsights?.riskLevel,
      )
        ? analysis.investorInsights.riskLevel
        : 'Medium',
      growthPotential: ['Low', 'Medium', 'High'].includes(
        analysis.investorInsights?.growthPotential,
      )
        ? analysis.investorInsights.growthPotential
        : 'Medium',
    },
    pitchDeck: {
      problem: ensureString(pitchDeckSource.problem),
      solution: ensureString(pitchDeckSource.solution),
      targetMarket: ensureString(pitchDeckSource.targetMarket),
      businessModel: ensureString(pitchDeckSource.businessModel),
      competition: ensureString(
        pitchDeckSource.competitiveAdvantage || pitchDeckSource.competition,
      ),
      financialSummary: ensureString(pitchDeckSource.financialSummary),
      roadmap: ensureStringArray(pitchDeckSource.roadmap),
    },
  }
}

const ensureAnalysisCompleteness = (analysis) => {
  const requiredStrings = [
    analysis.marketAnalysis,
    analysis.competitorOverview,
    analysis.riskAssessment,
    analysis.pitchDeck.problem,
    analysis.pitchDeck.solution,
    analysis.pitchDeck.targetMarket,
    analysis.pitchDeck.businessModel,
    analysis.pitchDeck.competition,
  ]

  const hasMissingString = requiredStrings.some((value) => !ensureString(value))
  const hasMissingSuggestions = analysis.suggestions.length === 0
  const hasMissingBusinessModel = [
    analysis.businessModel.customerSegments,
    analysis.businessModel.valueProposition,
    analysis.businessModel.channels,
    analysis.businessModel.revenueStreams,
    analysis.businessModel.costStructure,
  ].some((value) => value.length === 0)

  if (hasMissingString || hasMissingSuggestions || hasMissingBusinessModel) {
    throw createAiFailure()
  }

  return analysis
}

const sanitizeAnalysisForSave = (ideaData, analysis) => {
  const normalizedAnalysis = applyAnalysisFallbacks(ideaData, {
    ...analysis,
    aiText: ensureString(analysis.aiText),
  })

  return {
    ...normalizedAnalysis,
    aiAnalysis:
      ensureString(normalizedAnalysis.aiAnalysis) ||
      ensureString(normalizedAnalysis.aiText) ||
      [
        normalizedAnalysis.marketAnalysis,
        normalizedAnalysis.competitorOverview,
        normalizedAnalysis.riskAssessment,
      ]
        .filter(Boolean)
        .join(' '),
    aiText:
      ensureString(normalizedAnalysis.aiText) ||
      [
        normalizedAnalysis.marketAnalysis,
        normalizedAnalysis.competitorOverview,
        normalizedAnalysis.riskAssessment,
      ]
        .filter(Boolean)
        .join(' '),
    businessModelCanvas:
      normalizedAnalysis.businessModelCanvas &&
      Object.values(normalizedAnalysis.businessModelCanvas).every(
        (value) => Array.isArray(value) && value.length > 0,
      )
        ? normalizedAnalysis.businessModelCanvas
        : normalizedAnalysis.businessModel,
  }
}

const buildPrompt = (ideaData) => {
  return `
You are Startup Validator's backend AI analyst.
Analyze this startup idea and respond with ONLY valid JSON.
Do not include markdown fences, commentary, labels, or any text before or after the JSON object.

Title: ${ideaData.title}
Description: ${ideaData.description}
Industry: ${ideaData.industry}
Target Audience: ${ideaData.targetAudience}

Use this exact shape:
{
  "marketAnalysis": "",
  "competitorOverview": "",
  "riskAssessment": "",
  "suggestions": ["", "", ""],
  "businessModelCanvas": {
    "customerSegments": "",
    "valueProposition": "",
    "channels": "",
    "revenueStreams": "",
    "costStructure": ""
  },
  "financialProjection": {
    "initialInvestment": 0,
    "monthlyCost": 0,
    "expectedRevenue": 0,
    "breakEvenMonths": 0,
    "yearlyProfit": 0
  },
  "investorInsights": {
    "fundingRequired": 0,
    "roiEstimate": 0,
    "riskLevel": "Low|Medium|High",
    "growthPotential": "Low|Medium|High"
  },
  "pitchDeck": {
    "problem": "",
    "solution": "",
    "targetMarket": "",
    "businessModel": "",
    "competitiveAdvantage": ""
  }
}

Rules:
- Base the analysis only on the provided input.
- If the idea is vague or underspecified, say so clearly.
- Keep text concise, realistic, and investor-friendly.
- Do not invent precise market statistics or real competitor names unless directly implied.
- Financial values should be rough but internally consistent.
- Every required field must be present.
- Return one JSON object only.
`.trim()
}

const getGeminiClient = () => {
  const provider = ensureString(process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const apiKey = ensureString(process.env.GEMINI_API_KEY)

  if (provider !== 'gemini') {
    throw new Error('AI service not configured properly')
  }

  if (!apiKey || apiKey === 'your_real_key') {
    throw new Error('AI service not configured properly')
  }

  return new GoogleGenerativeAI(apiKey)
}

const requestGeminiAnalysis = async (genAI, modelName, prompt) => {
  try {
    console.log(`Gemini model selected: ${modelName}`)
    const model = genAI.getGenerativeModel({
      model: modelName,
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    })
    const response = await result.response
    const text = response.text()
    const parsedAnalysis = parseGeminiJson(text)
    const validatedAnalysis = ensureAnalysisCompleteness(
      validateAnalysis(parsedAnalysis),
    )

    console.log(
      '[AI] Gemini structured response:',
      JSON.stringify(
        {
          aiText: validatedAnalysis.aiText,
          marketAnalysis: validatedAnalysis.marketAnalysis,
          competitorOverview: validatedAnalysis.competitorOverview,
          riskAssessment: validatedAnalysis.riskAssessment,
          suggestions: validatedAnalysis.suggestions,
          businessModel: validatedAnalysis.businessModel,
          pitchDeck: validatedAnalysis.pitchDeck,
        },
        null,
        2,
      ),
    )

    return {
      ...validatedAnalysis,
      aiText: validatedAnalysis.aiText,
    }
  } catch (error) {
    logGeminiFailure(modelName, error)
    throw error
  }
}

export const generateAIAnalysis = async (ideaData) => {
  try {
    const genAI = getGeminiClient()
    const prompt = buildPrompt(ideaData)
    const configuredModel = ensureString(process.env.AI_MODEL) || DEFAULT_MODEL

    try {
      return sanitizeAnalysisForSave(
        ideaData,
        await requestGeminiAnalysis(genAI, configuredModel, prompt),
      )
    } catch (error) {
      const statusCode = extractStatusCode(error)
      const shouldRetryWithFallback =
        statusCode === 503 && configuredModel !== FALLBACK_MODEL

      if (!shouldRetryWithFallback) {
        throw error
      }

      console.warn(
        `[AI] Retrying Gemini request with fallback model=${FALLBACK_MODEL} after status=503`,
      )

      return sanitizeAnalysisForSave(
        ideaData,
        await requestGeminiAnalysis(genAI, FALLBACK_MODEL, prompt),
      )
    }
  } catch (error) {
    console.log('Gemini failed, using fallback')
    return sanitizeAnalysisForSave(ideaData, buildFallbackAnalysis(ideaData))
  }
}

export const analyzeStartupIdea = async (ideaData) => {
  return generateAIAnalysis(ideaData)
}
