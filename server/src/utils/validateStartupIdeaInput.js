const INVALID_IDEA_MESSAGE =
  'Please enter a meaningful startup idea with a clear problem, solution, target audience, and business potential.'

const RANDOM_OR_PLACEHOLDER_WORDS = new Set([
  'abc',
  'abcd',
  'abcde',
  'asdf',
  'asdfg',
  'asdfgh',
  'byy',
  'demo',
  'ghi',
  'hello',
  'hii',
  'lorem',
  'placeholder',
  'qwerty',
  'random',
  'sample',
  'sdef',
  'temp',
  'test',
  'testing',
  'trial',
  'xyz',
])

const GENERIC_FIELD_VALUES = new Set([
  'abc',
  'all',
  'anyone',
  'business',
  'businesses',
  'company',
  'customers',
  'everyone',
  'general',
  'market',
  'misc',
  'na',
  'n a',
  'none',
  'other',
  'public',
  'startup',
  'target audience',
  'unknown',
  'user',
  'users',
])

const PROBLEM_KEYWORDS = [
  'problem',
  'struggle',
  'difficulty',
  'challenge',
  'issue',
  'lack',
  'inefficient',
  'expensive',
  'confusing',
  'time consuming',
  'time-consuming',
]

const SOLUTION_KEYWORDS = [
  'solution',
  'provides',
  'helps',
  'enables',
  'allows',
  'generates',
  'recommends',
  'tracks',
  'automates',
  'connects',
]

const MONETIZATION_KEYWORDS = [
  'revenue',
  'subscription',
  'pricing',
  'saas',
  'marketplace',
  'scalable',
  'expansion',
  'premium',
]

const AUDIENCE_KEYWORDS = [
  'users',
  'customers',
  'students',
  'beginners',
  'parents',
  'teachers',
  'professionals',
  'startups',
  'businesses',
  'gym members',
]

const WORKFLOW_KEYWORDS = [
  'signup',
  'profile',
  'dashboard',
  'input',
  'analyze',
  'generate',
  'track',
  'monitor',
  'report',
  'recommendation',
]

const SENTENCE_STRUCTURE_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'because',
  'by',
  'can',
  'for',
  'from',
  'how',
  'if',
  'in',
  'into',
  'is',
  'of',
  'on',
  'so',
  'that',
  'the',
  'their',
  'them',
  'there',
  'they',
  'this',
  'through',
  'to',
  'when',
  'who',
  'with',
])

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getTokens = (value) =>
  normalizeText(value)
    .split(' ')
    .filter(Boolean)

const countKeywordMatches = (text, keywords) =>
  keywords.reduce(
    (count, keyword) => count + (text.includes(normalizeText(keyword)) ? 1 : 0),
    0,
  )

const hasKeyword = (text, keywords, minimum = 1) =>
  countKeywordMatches(text, keywords) >= minimum

const getSentenceCount = (value) => {
  const matches = String(value || '')
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  if (matches.length > 0) {
    return matches.length
  }

  const normalized = normalizeText(value)
  if (!normalized) {
    return 0
  }

  return normalized
    .split(/\b(?:and|because|but|so|while|which|who|when)\b/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length
}

const hasRepeatedWordPattern = (tokens) => {
  if (tokens.length < 3) {
    return false
  }

  return new Set(tokens).size <= Math.ceil(tokens.length / 3)
}

const hasOnlyVeryShortWords = (tokens) => {
  if (!tokens.length) {
    return true
  }

  return tokens.every((token) => token.length <= 3)
}

const hasSentenceStructure = (tokens) =>
  tokens.some((token) => SENTENCE_STRUCTURE_WORDS.has(token))

const getIdeaSignalScore = (text) => {
  let score = 0

  if (hasKeyword(text, PROBLEM_KEYWORDS)) {
    score += 1
  }

  if (hasKeyword(text, SOLUTION_KEYWORDS)) {
    score += 1
  }

  if (hasKeyword(text, AUDIENCE_KEYWORDS)) {
    score += 1
  }

  if (hasKeyword(text, WORKFLOW_KEYWORDS)) {
    score += 1
  }

  if (hasKeyword(text, MONETIZATION_KEYWORDS)) {
    score += 1
  }

  return score
}

const hasMostlyRandomTokens = (value) => {
  const tokens = getTokens(value)

  if (!tokens.length) {
    return true
  }

  const blockedTokenCount = tokens.filter((token) =>
    RANDOM_OR_PLACEHOLDER_WORDS.has(token),
  ).length

  if (blockedTokenCount >= 1) {
    return true
  }

  const suspiciousTokenCount = tokens.filter((token) => {
    if (token.length <= 2) {
      return true
    }

    if (/^[a-z]{3,5}$/.test(token) && !/[aeiou]/.test(token)) {
      return true
    }

    if (/^(.)\1{2,}$/.test(token)) {
      return true
    }

    return false
  }).length

  return suspiciousTokenCount === tokens.length
}

const isGenericField = (value, minLength = 4) => {
  const normalized = normalizeText(value)

  if (!normalized || normalized.length < minLength) {
    return true
  }

  if (GENERIC_FIELD_VALUES.has(normalized)) {
    return true
  }

  return hasMostlyRandomTokens(normalized)
}

export const validateStartupIdeaInput = ({
  title,
  description,
  industry,
  targetAudience,
} = {}) => {
  const normalizedTitle = normalizeText(title)
  const normalizedDescription = normalizeText(description)
  const normalizedIndustry = normalizeText(industry)
  const normalizedTargetAudience = normalizeText(targetAudience)
  const descriptionTokens = getTokens(description)
  const combinedContext = [
    normalizedTitle,
    normalizedDescription,
    normalizedIndustry,
    normalizedTargetAudience,
  ]
    .filter(Boolean)
    .join(' ')

  if (
    !normalizedTitle ||
    !normalizedDescription ||
    !normalizedIndustry ||
    !normalizedTargetAudience
  ) {
    return { isValid: false, message: INVALID_IDEA_MESSAGE }
  }

  if (normalizedTitle.length < 20 || hasMostlyRandomTokens(normalizedTitle)) {
    return { isValid: false, message: INVALID_IDEA_MESSAGE }
  }

  if (normalizedDescription.length < 200 || hasMostlyRandomTokens(normalizedDescription)) {
    return { isValid: false, message: INVALID_IDEA_MESSAGE }
  }

  if (getSentenceCount(description) < 2) {
    return { isValid: false, message: INVALID_IDEA_MESSAGE }
  }

  if (isGenericField(normalizedIndustry) || isGenericField(normalizedTargetAudience, 5)) {
    return { isValid: false, message: INVALID_IDEA_MESSAGE }
  }

  if (
    hasRepeatedWordPattern(descriptionTokens) ||
    hasOnlyVeryShortWords(descriptionTokens) ||
    !hasSentenceStructure(descriptionTokens) ||
    getIdeaSignalScore(combinedContext) < 3
  ) {
    return { isValid: false, message: INVALID_IDEA_MESSAGE }
  }

  return { isValid: true, message: '' }
}

export { INVALID_IDEA_MESSAGE }
