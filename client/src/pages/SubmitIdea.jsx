import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'

const checklist = [
  'Define a clear user problem',
  'Mention the audience and market',
  'Describe the workflow or product logic',
  'Explain why it can scale',
  'Keep the concept realistic and focused',
]

const invalidIdeaMessage =
  'Please enter a meaningful startup idea with a clear problem, solution, target audience, and business potential.'

const blockedTerms = new Set([
  'abc',
  'abcd',
  'abcde',
  'asdf',
  'asdfg',
  'asdfgh',
  'byy',
  'dddd',
  'demo',
  'ghi',
  'hello',
  'hii',
  'placeholder',
  'qwerty',
  'random',
  'sample',
  'sdef',
  'test',
  'testing',
  '12345',
  'xxxxx',
  'xyz',
  'aaaa',
])

const genericFields = new Set([
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
  'none',
  'other',
  'public',
  'startup',
  'target audience',
  'unknown',
  'user',
  'users',
])

const problemKeywords = [
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

const solutionKeywords = [
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

const audienceKeywords = [
  'students',
  'beginners',
  'professionals',
  'startups',
  'users',
  'customers',
  'gym members',
  'parents',
  'teachers',
  'businesses',
]

const workflowKeywords = [
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

const monetizationKeywords = [
  'subscription',
  'premium',
  'revenue',
  'saas',
  'marketplace',
  'scalable',
  'expansion',
  'pricing',
]

const sentenceStructureWords = new Set([
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
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const hasBlockedTerm = (value) => {
  const normalized = normalizeText(value)
  return normalized
    .split(' ')
    .some((token) => token && blockedTerms.has(token))
}

const hasMostlyRepeatedCharacters = (value) => {
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (compact.length < 5) {
    return false
  }

  const counts = [...compact].reduce((map, char) => {
    map[char] = (map[char] || 0) + 1
    return map
  }, {})

  const highestFrequency = Math.max(...Object.values(counts))
  const uniqueCharacters = Object.keys(counts).length

  return highestFrequency / compact.length >= 0.65 || uniqueCharacters <= 2
}

const hasMeaningfulWordCount = (value, minWords = 3) => {
  const meaningfulWords = normalizeText(value)
    .split(' ')
    .filter((word) => word.length >= 3 && !/^\d+$/.test(word))

  return meaningfulWords.length >= minWords
}

const hasKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword))

const countKeywordMatches = (text, keywords) =>
  keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0)

const getTokens = (value) =>
  normalizeText(value)
    .split(' ')
    .filter(Boolean)

const getSentenceCount = (value) => {
  const explicitSentences = value
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  if (explicitSentences.length > 0) {
    return explicitSentences.length
  }

  return normalizeText(value)
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

const hasOnlyVeryShortWords = (tokens) =>
  tokens.length ? tokens.every((token) => token.length <= 3) : true

const hasSentenceStructure = (tokens) =>
  tokens.some((token) => sentenceStructureWords.has(token))

const getIdeaSignalScore = (text) => {
  let score = 0

  if (hasKeyword(text, problemKeywords)) {
    score += 1
  }

  if (hasKeyword(text, solutionKeywords)) {
    score += 1
  }

  if (hasKeyword(text, audienceKeywords)) {
    score += 1
  }

  if (hasKeyword(text, workflowKeywords)) {
    score += 1
  }

  if (hasKeyword(text, monetizationKeywords)) {
    score += 1
  }

  return score
}

const isGenericField = (value, minLength = 4) => {
  const normalized = normalizeText(value)

  return (
    !normalized ||
    normalized.length < minLength ||
    genericFields.has(normalized) ||
    hasBlockedTerm(normalized) ||
    hasMostlyRepeatedCharacters(normalized) ||
    !hasMeaningfulWordCount(normalized, 1)
  )
}

const validateIdeaSubmission = ({ title, description, industry, targetAudience }) => {
  const titleTrimmed = title.trim()
  const descriptionTrimmed = description.trim()
  const industryTrimmed = industry.trim()
  const targetAudienceTrimmed = targetAudience.trim()
  const normalizedDescription = normalizeText(descriptionTrimmed)
  const descriptionTokens = getTokens(descriptionTrimmed)
  const combinedContext = normalizeText(
    `${titleTrimmed} ${descriptionTrimmed} ${industryTrimmed} ${targetAudienceTrimmed}`,
  )

  if (titleTrimmed.replace(/\s+/g, ' ').length < 20) {
    return invalidIdeaMessage
  }

  if (
    hasBlockedTerm(titleTrimmed) ||
    hasMostlyRepeatedCharacters(titleTrimmed) ||
    !hasMeaningfulWordCount(titleTrimmed)
  ) {
    return invalidIdeaMessage
  }

  if (descriptionTrimmed.length < 200) {
    return invalidIdeaMessage
  }

  if (getSentenceCount(descriptionTrimmed) < 2) {
    return invalidIdeaMessage
  }

  if (
    hasBlockedTerm(descriptionTrimmed) ||
    hasMostlyRepeatedCharacters(descriptionTrimmed) ||
    hasRepeatedWordPattern(descriptionTokens) ||
    hasOnlyVeryShortWords(descriptionTokens) ||
    !hasSentenceStructure(descriptionTokens) ||
    getIdeaSignalScore(combinedContext) < 3
  ) {
    return invalidIdeaMessage
  }

  if (isGenericField(industryTrimmed)) {
    return invalidIdeaMessage
  }

  if (isGenericField(targetAudienceTrimmed, 5)) {
    return invalidIdeaMessage
  }

  return ''
}

function SubmitIdea() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    targetAudience: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setError('')
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validateIdeaSubmission(formData)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const { data } = await api.post('/ideas/submit', formData)
      const reportId = data?.report?._id

      if (!reportId) {
        throw new Error('Report generation failed. Please try again.')
      }

      navigate(`/report/${reportId}`, {
        replace: true,
        state: { report: data.report, idea: data.idea },
      })
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
          submitError.message ||
          'Unable to generate the AI report right now. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell py-10 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft">
          <p className="section-kicker">Input Guide</p>
          <h2 className="mt-3 text-2xl font-extrabold text-ink">
            AI submission checklist
          </h2>
          <div className="mt-6 space-y-4">
            {checklist.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4"
              >
                <div className="icon-badge h-9 w-9 text-xs">{index + 1}</div>
                <p className="text-sm text-slate-400">{item}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft sm:p-10">
          <p className="section-kicker">Submit Idea</p>
          <h1 className="mt-3 section-title">Submit Startup Idea</h1>
          <p className="mt-3 text-slate-400">
            Share your startup concept and Startup Validator will generate a sharp AI feasibility report with analytics-style output.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Idea Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="premium-input"
                placeholder="Example: AI-based student career guidance platform"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="premium-input min-h-[160px] resize-y"
                placeholder="Describe the problem, solution, and how your idea works."
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="industry"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Industry
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  value={formData.industry}
                  onChange={handleChange}
                  className="premium-input"
                  placeholder="EdTech, HealthTech, FinTech"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="targetAudience"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Target Audience
                </label>
                <input
                  id="targetAudience"
                  name="targetAudience"
                  type="text"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="premium-input"
                  placeholder="College students, startups, parents"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="premium-button rounded-3xl px-6 py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? 'Generating AI feasibility report...'
                : 'Submit and Analyze'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SubmitIdea
