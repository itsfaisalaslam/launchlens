const buildGeneralAdvice = (message) => {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('risk')) {
    return 'Focus first on customer adoption risk, competitive differentiation, and execution feasibility. Validate your assumptions with early users, narrow the MVP scope, and identify the one metric that will prove traction quickly.'
  }

  if (normalizedMessage.includes('pitch')) {
    return 'When pitching, lead with the problem, explain why existing alternatives are insufficient, show your solution clearly, and support it with a believable market opportunity plus a simple financial story.'
  }

  if (
    normalizedMessage.includes('revenue') ||
    normalizedMessage.includes('monet')
  ) {
    return 'Start with a simple revenue model that matches user behavior. A subscription or freemium-to-premium approach often works well if users receive recurring value, while service or partnership pricing can support early cash flow.'
  }

  return 'Strengthen your idea by clarifying the target customer, narrowing the core problem, and testing the smallest possible solution. The more specific your audience and outcome, the easier it becomes to validate demand and communicate value.'
}

export const generateMentorReply = ({ message, report }) => {
  const generalAdvice = buildGeneralAdvice(message)

  if (!report) {
    return generalAdvice
  }

  const ideaTitle = report.ideaId?.title || 'your startup idea'
  const industry = report.ideaId?.industry || 'your industry'
  const audience = report.ideaId?.targetAudience || 'your target audience'
  const strongestScore = Object.entries(report.dimensionScores || {}).sort(
    (a, b) => b[1] - a[1],
  )[0]
  const weakestScore = Object.entries(report.dimensionScores || {}).sort(
    (a, b) => a[1] - b[1],
  )[0]

  const strongestLabel = strongestScore
    ? strongestScore[0].replace(/([A-Z])/g, ' $1').trim()
    : 'market fit'
  const weakestLabel = weakestScore
    ? weakestScore[0].replace(/([A-Z])/g, ' $1').trim()
    : 'execution focus'

  return `${generalAdvice} For ${ideaTitle}, your report suggests the strongest area is ${strongestLabel}, while ${weakestLabel} needs the most attention. In ${industry}, I would prioritize sharper positioning for ${audience}, test the weakest area with real users, and turn one of the current suggestions into a short 2-week action plan.`
}
