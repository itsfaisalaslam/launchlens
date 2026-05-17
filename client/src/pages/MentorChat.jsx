import { useEffect, useState } from 'react'
import api from '../services/api.js'

const quickPrompts = [
  'How can I improve this idea?',
  'What risks should I focus on?',
  'How can I pitch this idea?',
  'Suggest revenue model',
]

function MentorChat() {
  const [ideas, setIdeas] = useState([])
  const [selectedReportId, setSelectedReportId] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'mentor',
      content:
        'I am your Startup Validator AI mentor. Ask me about improving your idea, reducing risk, refining your pitch, or choosing a revenue model.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const { data } = await api.get('/ideas/my-ideas')
        setIdeas((data.ideas || []).filter((idea) => idea.report))
      } catch {
        return
      }
    }

    fetchIdeas()
  }, [])

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) {
      return
    }

    const userMessage = {
      role: 'user',
      content: messageText.trim(),
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/mentor/chat', {
        message: userMessage.content,
        reportId: selectedReportId || undefined,
      })

      setMessages((current) => [
        ...current,
        { role: 'mentor', content: data.reply },
      ])
    } catch (chatError) {
      setError(
        chatError.response?.data?.message ||
          'Unable to get mentor advice right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await sendMessage(input)
  }

  return (
    <div className="page-shell space-y-8 py-10 lg:py-14">
      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-float">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          AI Mentor
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">
          Improve your startup idea with guided advice
        </h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Ask for mentor-style feedback on positioning, risk, pitch quality, or revenue strategy. Optionally select one of your reports to get advice tailored to that idea.
        </p>
      </div>

      <div className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
        <label
          htmlFor="reportContext"
          className="mb-2 block text-sm font-semibold text-slate-300"
        >
          Optional report context
        </label>
        <select
          id="reportContext"
          value={selectedReportId}
          onChange={(event) => setSelectedReportId(event.target.value)}
          className="premium-input"
        >
          <option value="">No report selected</option>
          {ideas.map((idea) => (
            <option key={idea.report._id} value={idea.report._id}>
              {idea.title}
            </option>
          ))}
        </select>

        <div className="mt-5 flex flex-wrap gap-3">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-line bg-card shadow-soft">
        <div className="border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="icon-badge h-10 w-10 text-xs">AI</div>
            <p className="text-sm font-semibold text-slate-300">Mentor conversation</p>
          </div>
        </div>
        <div className="max-h-[30rem] space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl rounded-[1.75rem] px-5 py-4 text-sm leading-7 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-cta-gradient text-white'
                    : 'border border-line bg-panel text-slate-300'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-3xl border border-line bg-panel px-5 py-4 text-sm text-slate-400">
                Mentor is thinking...
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mx-6 mt-1 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="border-t border-line px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the mentor how to improve your startup idea..."
              className="premium-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="premium-button min-w-[120px] rounded-3xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MentorChat
