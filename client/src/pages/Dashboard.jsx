import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import { resolveFinancialModel } from '../utils/financialModel.js'

function Dashboard() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getFirstItem = (items) =>
    Array.isArray(items) && items.length > 0 ? items[0] : ''

  const enrichedIdeas = useMemo(
    () =>
      ideas.map((idea) => {
        if (!idea.report) {
          return idea
        }

        const financialModel = resolveFinancialModel({
          ...idea.report,
          title: idea.title,
          industry: idea.industry,
          description: idea.description,
          targetAudience: idea.targetAudience,
        })

        return {
          ...idea,
          report: {
            ...idea.report,
            aiAnalysis:
              idea.report?.aiAnalysis || idea.report?.aiText,
            financialProjection: {
              ...idea.report.financialProjection,
              initialInvestment: financialModel.initialInvestment,
              monthlyCost: financialModel.monthlyCost,
              expectedRevenue: financialModel.expectedRevenue,
              monthlyRevenue: financialModel.monthlyRevenue,
              breakEvenMonths: financialModel.breakEvenMonths,
              yearlyProfit: financialModel.yearlyProfit,
            },
            investorInsights: {
              ...idea.report.investorInsights,
              roiEstimate: financialModel.roi,
              riskLevel: financialModel.riskLevel,
            },
          },
        }
      }),
    [ideas],
  )

  const analyzedIdeas = enrichedIdeas.filter((idea) => idea.status === 'analyzed')
  const averageScore = analyzedIdeas.length
    ? Math.round(
        analyzedIdeas.reduce(
          (total, idea) => total + (idea.report?.overallScore || 0),
          0,
        ) / analyzedIdeas.length,
      )
    : 0

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
            'Unable to load your submitted ideas right now.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()
  }, [])

  const stats = [
    { label: 'Email', value: user?.email, icon: 'WS', wide: true },
    { label: 'Role', value: user?.role, icon: 'PR', capitalize: true },
    { label: 'Status', value: 'Authenticated', icon: 'OK', tone: 'success' },
    { label: 'Total Ideas', value: ideas.length, icon: 'ID' },
    { label: 'Analyzed Reports', value: analyzedIdeas.length, icon: 'RP' },
    { label: 'Average Score', value: averageScore || '--', icon: 'AV' },
  ]

  return (
    <div className="page-shell space-y-8 py-10 lg:py-14">
      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-float">
        <p className="section-kicker">Dashboard</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-3 text-slate-400">
          Track submissions, report readiness, and startup performance signals from one clean analytics workspace.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[1.75rem] border border-line bg-card p-4 ${
                stat.wide ? 'xl:col-span-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="icon-badge h-10 w-10 text-xs">{stat.icon}</div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p
                    className={`mt-1 font-semibold ${
                      stat.tone === 'success'
                        ? 'text-accent'
                        : 'text-ink'
                    } ${stat.capitalize ? 'capitalize' : ''}`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Submitted Ideas</h2>
            <p className="mt-2 text-slate-400">
              Review your startup ideas and open their latest AI analysis reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/compare" className="premium-button-secondary">
              Compare Ideas
            </Link>
            <Link to="/submit-idea" className="premium-button">
              Submit New Idea
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-[1.75rem] border border-line bg-card p-5 text-slate-400">
            Loading your ideas...
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        ) : null}

        {!loading && !error && enrichedIdeas.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-line bg-card px-6 py-12 text-center">
            <h3 className="text-2xl font-extrabold text-ink">No ideas submitted yet</h3>
            <p className="mt-3 text-slate-400">
              Start by submitting your first startup idea to generate a feasibility report.
            </p>
            <Link to="/submit-idea" className="mt-6 premium-button">
              Submit Your First Idea
            </Link>
          </div>
        ) : null}

        {!loading && !error && enrichedIdeas.length > 0 ? (
          <div className="mt-6 grid gap-5">
            {enrichedIdeas.map((idea) => (
              <article
                key={idea._id}
                className="rounded-[2rem] border border-line bg-card p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-float"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-extrabold text-ink">{idea.title}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          idea.status === 'analyzed'
                            ? 'bg-accent/15 text-accent'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {idea.status}
                      </span>
                    </div>
                    <p className="max-w-3xl text-slate-400">{idea.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                        Industry: {idea.industry}
                      </span>
                      <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1">
                        Audience: {idea.targetAudience}
                      </span>
                      <span className="rounded-full border border-line bg-panel px-3 py-1">
                        Submitted: {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {idea.report ? (
                      <div className="grid gap-3 pt-2 md:grid-cols-2">
                        <div className="rounded-2xl border border-line bg-panel p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            AI Analysis
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {idea.report?.aiAnalysis?.trim?.() ||
                              idea.report?.marketAnalysis?.trim?.() ||
                              'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Market Analysis
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {idea.report?.marketAnalysis?.trim?.() || 'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Competitor Overview
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {idea.report?.competitorOverview?.trim?.() || 'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Risk Assessment
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {idea.report?.riskAssessment?.trim?.() || 'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Business Model Canvas
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {getFirstItem(
                              idea.report?.businessModelCanvas?.valueProposition,
                            ) ||
                              getFirstItem(idea.report?.businessModel?.valueProposition) ||
                              'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Pitch Deck
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {idea.report?.pitchDeck?.problem?.trim?.() ||
                              idea.report?.pitchDeck?.solution?.trim?.() ||
                              'Not available'}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-4 rounded-[1.75rem] border border-line bg-panel p-5 shadow-soft">
                    <div>
                      <p className="text-sm text-slate-500">Report Status</p>
                      <p className="mt-1 font-semibold text-ink">
                        {idea.report ? 'Ready to view' : 'Pending analysis'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Overall Score</p>
                      <p className="mt-1 text-4xl font-bold text-ink">
                        {idea.report?.overallScore ?? '--'}
                      </p>
                    </div>
                    <Link
                      to={`/report/${idea.report?._id}`}
                      state={idea.report ? { report: idea.report, idea } : undefined}
                      className={`inline-flex justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${
                        idea.report
                          ? 'bg-cta-gradient text-white hover:-translate-y-0.5'
                          : 'cursor-not-allowed bg-slate-700 text-slate-400'
                      }`}
                      onClick={(event) => {
                        if (!idea.report) {
                          event.preventDefault()
                        }
                      }}
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Dashboard
