import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Real AI Analysis',
    icon: 'AI',
    badge: 'Engine',
    description:
      'Run startup ideas through structured feasibility analysis with clear reasoning signals.',
  },
  {
    title: 'SWOT Report',
    icon: 'SW',
    badge: 'Strategy',
    description:
      'Review strengths, weaknesses, opportunities, and threats in a boardroom-ready layout.',
  },
  {
    title: 'Financial Projection',
    icon: 'FP',
    badge: 'Forecast',
    description:
      'Estimate cost, break-even timing, and profit potential with a clean analytics-first view.',
  },
  {
    title: 'Investor Insights',
    icon: 'IV',
    badge: 'Signals',
    description:
      'Spot funding requirements, risk levels, and growth potential before you present.',
  },
  {
    title: 'PDF Export',
    icon: 'PDF',
    badge: 'Export',
    description:
      'Generate polished reports ready for reviews, demos, and project presentations.',
  },
  {
    title: 'AI Mentor',
    icon: 'AM',
    badge: 'Coach',
    description:
      'Ask targeted follow-up questions and refine your idea with mentor-style feedback.',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Input the startup concept',
    description:
      'Capture the problem, audience, market, and idea logic with a clear submission flow.',
  },
  {
    step: '02',
    title: 'Generate intelligence',
    description:
      'Startup Validator analyzes the idea and produces scores, SWOT, financials, and guidance.',
  },
  {
    step: '03',
    title: 'Refine and present',
    description:
      'Use the report to improve your concept, compare ideas, and present stronger decisions.',
  },
]

const terminalRows = [
  { label: 'Feasibility Score', value: '84/100', tone: 'text-accent' },
  { label: 'Risk Signal', value: 'Moderate', tone: 'text-secondary' },
  { label: 'Market Readiness', value: 'Positive', tone: 'text-primary' },
]

const highlights = [
  'Demand and competition mapping',
  'Execution and revenue readiness',
  'Investor-facing opportunity summary',
]

function Home() {
  return (
    <div className="pb-12 pt-6">
      <section className="page-shell py-10 lg:py-16">
        <div className="overflow-hidden rounded-[2.5rem] border border-line bg-hero-grid shadow-float">
          <div className="grid gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-16">
            <div>
              <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Startup Validator System
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Validate startup ideas with the feel of an AI analytics terminal.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                Startup Validator helps students and founders turn rough concepts into structured AI-generated feasibility reports, strategy summaries, and financial signals.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="premium-button">
                  Get Started
                </Link>
                <Link to="/submit-idea" className="premium-button-secondary">
                  Submit Idea
                </Link>
              </div>
              <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-line bg-card p-4">
                  <p className="text-2xl font-extrabold text-ink">6</p>
                  <p className="mt-1 text-sm text-slate-400">analysis modules</p>
                </div>
                <div className="rounded-[1.75rem] border border-line bg-card p-4">
                  <p className="text-2xl font-extrabold text-ink">AI</p>
                  <p className="mt-1 text-sm text-slate-400">reasoning workflow</p>
                </div>
                <div className="rounded-[1.75rem] border border-line bg-card p-4">
                  <p className="text-2xl font-extrabold text-ink">PDF</p>
                  <p className="mt-1 text-sm text-slate-400">report exports</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
                    Live Preview
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-ink">
                    Startup Validator Console
                  </h2>
                </div>
                <span className="insight-chip">Online</span>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-line bg-panel p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <p className="ml-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                    STARTUP-VALIDATOR.LOG
                  </p>
                </div>
                <div className="mt-5 space-y-4">
                  {terminalRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3"
                    >
                      <p className="text-sm text-slate-400">{row.label}</p>
                      <p className={`text-sm font-semibold ${row.tone}`}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  What Startup Validator checks
                </p>
                <div className="mt-4 space-y-3">
                  {highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[1.5rem] border border-line bg-panel p-4"
                    >
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                      <p className="text-sm text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-4">
        <div className="mb-8 max-w-2xl">
          <p className="section-kicker">Feature Suite</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
            Everything you need in a startup analytics workspace
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] border border-line bg-card p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-float"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="icon-badge">{feature.icon}</div>
                <span className="insight-chip">{feature.badge}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-ink">{feature.title}</h2>
              <p className="mt-3 leading-7 text-slate-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft">
          <div className="max-w-2xl">
            <p className="section-kicker">How It Works</p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink">
              A clear pipeline from idea to AI-generated report
            </h2>
            <p className="mt-3 text-slate-400">
              Startup Validator gives your final-year project the look and flow of a real startup intelligence platform.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {howItWorks.map((item) => (
              <article
                key={item.step}
                className="rounded-[2rem] border border-line bg-card p-6 shadow-soft"
              >
                <div className="inline-flex rounded-full bg-cta-gradient px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  Step {item.step}
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
