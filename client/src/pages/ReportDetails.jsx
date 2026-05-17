import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../services/api.js'
import { resolveFinancialModel } from '../utils/financialModel.js'

function ReportDetails() {
  const { reportId } = useParams()
  const location = useLocation()
  const [report, setReport] = useState(location.state?.report || null)
  const [loading, setLoading] = useState(!location.state?.report)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const reportRef = useRef(null)
  const pdfRef = useRef(null)

  const scoreChartData = report
    ? [
        { name: 'Market', score: report.dimensionScores?.marketOpportunity },
        { name: 'Unique', score: report.dimensionScores?.uniqueness },
        { name: 'Scale', score: report.dimensionScores?.scalability },
        { name: 'Finance', score: report.dimensionScores?.financialViability },
        { name: 'Execution', score: report.dimensionScores?.executionComplexity },
      ]
    : []

  const ideaTitle =
    location.state?.idea?.title || report?.ideaId?.title || 'Startup Idea'
  const normalizedFinancials = report
    ? resolveFinancialModel({
        ...report,
        title: ideaTitle,
        industry: report?.ideaId?.industry,
        description: report?.ideaId?.description || report?.pitchDeck?.problem,
        targetAudience: report?.ideaId?.targetAudience,
      })
    : null
  const generatedDate = report?.createdAt
    ? new Date(report.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString()
  const swot = report?.swot || {}
  const toNonEmptyArray = (value) =>
    Array.isArray(value) ? value.filter(Boolean) : []
  const getFirstAvailableArray = (...values) =>
    values.find((value) => Array.isArray(value) && value.length > 0) || []
  const getFirstAvailableText = (...values) =>
    values.find((value) => typeof value === 'string' && value.trim()) || ''
  const businessModelCanvas = report?.businessModelCanvas || {}
  const businessModel = {
    customerSegments: getFirstAvailableArray(
      businessModelCanvas?.customerSegments,
      report?.businessModel?.customerSegments,
    ),
    valueProposition: getFirstAvailableArray(
      businessModelCanvas?.valueProposition,
      report?.businessModel?.valueProposition,
    ),
    channels: getFirstAvailableArray(
      businessModelCanvas?.channels,
      report?.businessModel?.channels,
    ),
    revenueStreams: getFirstAvailableArray(
      businessModelCanvas?.revenueStreams,
      report?.businessModel?.revenueStreams,
    ),
    costStructure: getFirstAvailableArray(
      businessModelCanvas?.costStructure,
      report?.businessModel?.costStructure,
    ),
  }
  const financialProjection = normalizedFinancials
    ? {
        ...(report?.financialProjection || {}),
        initialInvestment: normalizedFinancials.initialInvestment,
        monthlyCost: normalizedFinancials.monthlyCost,
        expectedRevenue: normalizedFinancials.expectedRevenue,
        monthlyRevenue: normalizedFinancials.monthlyRevenue,
        breakEvenMonths: normalizedFinancials.breakEvenMonths,
        yearlyProfit: normalizedFinancials.yearlyProfit,
      }
    : report?.financialProjection || {}
  const pitchDeck = report?.pitchDeck || {}
  const investorInsights = normalizedFinancials
    ? {
        ...(report?.investorInsights || {}),
        roiEstimate: normalizedFinancials.roi,
        riskLevel: normalizedFinancials.riskLevel,
      }
    : report?.investorInsights || {}
  const aiAnalysisText =
    getFirstAvailableText(report?.aiAnalysis, report?.aiText) ||
    [
      report?.marketAnalysis,
      report?.competitorOverview,
      report?.riskAssessment,
    ]
      .filter(Boolean)
      .join(' ') ||
    'Analysis could not be generated, please try again.'
  const marketAnalysisText =
    report?.marketAnalysis || 'Analysis could not be generated, please try again.'
  const competitorOverviewText =
    report?.competitorOverview ||
    'Analysis could not be generated, please try again.'
  const riskAssessmentText =
    report?.riskAssessment || 'Analysis could not be generated, please try again.'
  const suggestionItems =
    report?.suggestions?.length
      ? report.suggestions
      : ['Analysis could not be generated, please try again.']
  const executiveSummary =
    aiAnalysisText ||
    `${ideaTitle} is being evaluated for feasibility in ${report?.ideaId?.industry || 'its target industry'} with a focus on ${report?.ideaId?.targetAudience || 'its intended audience'}.`
  const conclusionText = [
    `This report summarizes the feasibility, market readiness, competitive positioning, and execution risks for ${ideaTitle}.`,
    suggestionItems[0] || 'Further validation with real users is recommended before execution.',
  ].join(' ')
  const pdfBusinessModelSections = [
    ['Customer Segments', businessModel.customerSegments],
    ['Value Proposition', businessModel.valueProposition],
    ['Channels', businessModel.channels],
    ['Revenue Streams', businessModel.revenueStreams],
    ['Cost Structure', businessModel.costStructure],
  ]
  const pdfPitchDeckSections = [
    ['Problem', pitchDeck.problem],
    ['Solution', pitchDeck.solution],
    ['Target Market', pitchDeck.targetMarket],
    ['Business Model', pitchDeck.businessModel],
    ['Competition', pitchDeck.competition],
    ['Financial Summary', pitchDeck.financialSummary],
  ]
  const pdfScoreSections = [
    ['Overall Score', report?.overallScore],
    ['Market Opportunity', report?.dimensionScores?.marketOpportunity],
    ['Uniqueness', report?.dimensionScores?.uniqueness],
    ['Scalability', report?.dimensionScores?.scalability],
    ['Financial Viability', report?.dimensionScores?.financialViability],
    ['Execution Complexity', report?.dimensionScores?.executionComplexity],
  ]

  const visualAnalysisData = report
    ? [
        {
          name: 'Market Demand',
          value: report.dimensionScores?.marketOpportunity || 0,
          color: '#7c3aed',
        },
        {
          name: 'Competition',
          value: 100 - (report.dimensionScores?.uniqueness || 0),
          color: '#38bdf8',
        },
        {
          name: 'Scalability',
          value: report.dimensionScores?.scalability || 0,
          color: '#22c55e',
        },
        {
          name: 'Feasibility',
          value: report.overallScore || 0,
          color: '#a855f7',
        },
      ]
    : []

  const investorBarData = report
    ? [
        { name: 'Strengths', score: swot.strengths?.length ? swot.strengths.length * 10 : 0 },
        { name: 'Weaknesses', score: swot.weaknesses?.length ? swot.weaknesses.length * 10 : 0 },
        {
          name: 'Opportunities',
          score: swot.opportunities?.length ? swot.opportunities.length * 10 : 0,
        },
        { name: 'Threats', score: swot.threats?.length ? swot.threats.length * 10 : 0 },
        { name: 'Financial', score: report.dimensionScores?.financialViability || 0 },
      ]
    : []

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0)

  const pdfFinancialSections = [
    ['Initial Investment', formatCurrency(financialProjection?.initialInvestment)],
    ['Monthly Cost', formatCurrency(financialProjection?.monthlyCost)],
    ['Expected Monthly Revenue', formatCurrency(financialProjection?.expectedRevenue)],
    ['Break-even Months', `${financialProjection?.breakEvenMonths ?? 0} months`],
    ['Yearly Profit', formatCurrency(financialProjection?.yearlyProfit)],
    ['ROI Estimate', `${investorInsights?.roiEstimate ?? 0}%`],
  ]

  const renderListSection = (title, items, tone = 'slate') => (
    <div
      className={`rounded-2xl border p-5 ${
        tone === 'emerald'
          ? 'border-accent/25 bg-accent/10'
          : tone === 'amber'
            ? 'border-amber-400/25 bg-amber-500/10'
            : tone === 'rose'
              ? 'border-rose-400/25 bg-rose-500/10'
              : 'border-line bg-panel'
      }`}
    >
      <h4 className="text-lg font-semibold text-ink">{title}</h4>
      <ul className="mt-3 space-y-2">
        {(items || []).map((item) => (
          <li key={item} className="rounded-xl border border-line bg-card px-4 py-3 text-slate-300">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )

  const getRiskTone = (value) => {
    if (value === 'Low') {
      return 'border-accent/25 bg-accent/10 text-accent'
    }
    if (value === 'High') {
      return 'border-rose-400/25 bg-rose-500/10 text-rose-300'
    }
    return 'border-amber-400/25 bg-amber-500/10 text-amber-300'
  }

  const getGrowthTone = (value) => {
    if (value === 'High') {
      return 'border-accent/25 bg-accent/10 text-accent'
    }
    return 'border-secondary/25 bg-secondary/10 text-secondary'
  }

  useEffect(() => {
    const fetchReport = async () => {
      if (report) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const { data } = await api.get(`/reports/${reportId}`)
        setReport(data.report)
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            'Unable to load the report right now.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId, report])

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) {
      return
    }

    setDownloading(true)

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `startup-validator-report-${reportId}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: {
            mode: ['css', 'legacy'],
          },
        })
        .from(pdfRef.current)
        .save()
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyPitchDeck = async () => {
    const pitchDeckText = [
      `Startup Validator Pitch Deck Summary`,
      `Idea: ${ideaTitle}`,
      `Problem: ${pitchDeck.problem || ''}`,
      `Solution: ${pitchDeck.solution || ''}`,
      `Target Market: ${pitchDeck.targetMarket || ''}`,
      `Business Model: ${pitchDeck.businessModel || ''}`,
      `Competition: ${pitchDeck.competition || ''}`,
      `Financial Summary: ${pitchDeck.financialSummary || ''}`,
      `Roadmap:`,
      ...(pitchDeck.roadmap || []).map((item, index) => `${index + 1}. ${item}`),
    ].join('\n')

    await navigator.clipboard.writeText(pitchDeckText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="page-shell py-16">
        <div className="page-card">
          <p className="text-slate-400">Loading analysis report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell py-16">
        <div className="page-card">
          <h1 className="section-title">Report Details</h1>
          <p className="mt-3 text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell py-10 lg:py-14">
      <div
        aria-hidden="true"
        className="fixed left-[-200vw] top-0 z-[-1] w-[794px] overflow-hidden bg-white text-slate-900"
      >
        <div ref={pdfRef} className="bg-white text-slate-900">
          <section
            style={{
              minHeight: '1122px',
              padding: '88px 64px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              background:
                'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#4f46e5',
                marginBottom: '24px',
              }}
            >
              Startup Validator
            </p>
            <h1
              style={{
                fontSize: '40px',
                lineHeight: 1.15,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Startup Feasibility Report
            </h1>
            <p
              style={{
                fontSize: '22px',
                color: '#334155',
                marginTop: '18px',
                fontWeight: 600,
              }}
            >
              {ideaTitle}
            </p>
            <div
              style={{
                width: '120px',
                height: '4px',
                background: 'linear-gradient(90deg, #7c3aed, #38bdf8)',
                borderRadius: '999px',
                margin: '36px 0',
              }}
            />
            <div
              style={{
                display: 'grid',
                gap: '12px',
                fontSize: '16px',
                color: '#475569',
              }}
            >
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#0f172a' }}>Project:</strong> Startup Validator
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#0f172a' }}>Author:</strong> Faisal Aslam
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#0f172a' }}>Date:</strong> {generatedDate}
              </p>
            </div>
          </section>

          <section style={{ padding: '56px 56px 44px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Executive Summary
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '18px 0 24px',
              }}
            />
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#334155', margin: 0 }}>
              {executiveSummary}
            </p>

            <div
              style={{
                marginTop: '28px',
                padding: '24px',
                border: '1px solid #c7d2fe',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#ffffff',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  opacity: 0.82,
                }}
              >
                Feasibility Score
              </p>
              <p style={{ margin: '14px 0 0', fontSize: '44px', fontWeight: 800 }}>
                {report?.overallScore ?? 0}
              </p>
            </div>
          </section>

          {[
            ['AI Analysis', aiAnalysisText],
            ['Market Analysis', marketAnalysisText],
            ['Competitor Overview', competitorOverviewText],
            ['Risk Assessment', riskAssessmentText],
          ].map(([title, content]) => (
            <section
              key={title}
              style={{ padding: '8px 56px 30px' }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {title}
              </h2>
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: '#cbd5e1',
                  margin: '14px 0 20px',
                }}
              />
              <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#334155', margin: 0 }}>
                {content}
              </p>
            </section>
          ))}

          <section style={{ padding: '8px 56px 30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Scores
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '14px 0 20px',
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '14px',
              }}
            >
              {pdfScoreSections.map(([title, value]) => (
                <div
                  key={title}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '16px 18px',
                    background: '#ffffff',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                    {title}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                    {value ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '8px 56px 30px', breakBefore: 'page' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Business Model Canvas
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '14px 0 20px',
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              {pdfBusinessModelSections.map(([title, items]) => (
                <div
                  key={title}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '18px',
                    background: '#ffffff',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    {title}
                  </h3>
                    <div style={{ marginTop: '12px' }}>
                    {(items?.length ? items : ['Analysis could not be generated, please try again.']).map((item) => (
                      <p
                        key={`${title}-${item}`}
                        style={{
                          margin: '0 0 8px',
                          fontSize: '14px',
                          lineHeight: 1.7,
                          color: '#334155',
                        }}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '8px 56px 30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Pitch Deck Summary
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '14px 0 20px',
              }}
            />
            <div style={{ display: 'grid', gap: '14px' }}>
              {pdfPitchDeckSections.map(([title, value]) => (
                <div
                  key={title}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    background: '#ffffff',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      margin: '10px 0 0',
                      fontSize: '14px',
                      lineHeight: 1.75,
                      color: '#334155',
                    }}
                  >
                    {value || 'Analysis could not be generated, please try again.'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '8px 56px 30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Suggestions
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '14px 0 20px',
              }}
            />
            <div style={{ display: 'grid', gap: '12px' }}>
              {suggestionItems.map((item) => (
                <div
                  key={item}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '16px 18px',
                    background: '#ffffff',
                    fontSize: '14px',
                    lineHeight: 1.75,
                    color: '#334155',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '8px 56px 30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Financials
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '14px 0 20px',
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '14px',
              }}
            >
              {pdfFinancialSections.map(([title, value]) => (
                <div
                  key={title}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '16px 18px',
                    background: '#ffffff',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                    {title}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: '8px 56px 30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Conclusion
            </h2>
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#cbd5e1',
                margin: '14px 0 20px',
              }}
            />
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#334155', margin: 0 }}>
              {conclusionText || 'Not Available'}
            </p>
          </section>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Startup Validator Report
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">
            Feasibility Report
          </h1>
          <p className="mt-2 text-slate-400">
            AI-generated startup analysis for{' '}
            <span className="font-semibold text-ink">{ideaTitle}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="premium-button sticky top-28 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {downloading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      </div>

      <div ref={reportRef} className="rounded-[2rem] border border-line bg-panel p-5 shadow-float sm:p-8">
        <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Startup Validator
            </p>
            <h2 className="mt-3 text-3xl font-bold text-ink">{ideaTitle}</h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Startup idea validator and AI-generated business feasibility report.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full border border-line bg-card px-3 py-1">
                Generated: {generatedDate}
              </span>
              <span className="rounded-full border border-line bg-card px-3 py-1">
                Report ID: {reportId}
              </span>
              {report?.ideaId?.industry ? (
                <span className="rounded-full border border-line bg-card px-3 py-1">
                  Industry: {report.ideaId.industry}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/25 bg-cta-gradient px-8 py-6 text-center text-white shadow-float lg:min-w-[240px]">
            <p className="text-sm uppercase tracking-[0.2em] text-purple-100">
              Feasibility Score
            </p>
            <p className="mt-4 text-5xl font-bold">{report?.overallScore}</p>
            <div className="mt-3 inline-flex rounded-full bg-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              AI Generated
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-ink">Dimension Scores</h3>
                  <p className="mt-2 text-slate-400">
                    Visual breakdown of the key feasibility factors.
                  </p>
                </div>
                <div className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm">
                  Overall: {report?.overallScore}/100
                </div>
              </div>
              <div className="mt-6 h-80 w-full rounded-2xl border border-line bg-panel p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreChartData} barSize={34}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="score" fill="#7c3aed" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                Investor Insights
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-line bg-panel p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <p className="text-sm text-slate-500">Funding Required</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {formatCurrency(investorInsights.fundingRequired)}
                  </p>
                </div>
                <div className="rounded-2xl border border-accent/25 bg-accent/10 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <p className="text-sm text-accent">ROI Estimate</p>
                  <p className="mt-2 text-2xl font-bold text-accent">
                    {investorInsights.roiEstimate || 0}%
                  </p>
                </div>
                <div className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${getRiskTone(investorInsights.riskLevel)}`}>
                  <p className="text-sm">Risk Level</p>
                  <p className="mt-2 text-2xl font-bold">
                    {investorInsights.riskLevel || 'Medium'}
                  </p>
                </div>
                <div className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${getGrowthTone(investorInsights.growthPotential)}`}>
                  <p className="text-sm">Growth Potential</p>
                  <p className="mt-2 text-2xl font-bold">
                    {investorInsights.growthPotential || 'Medium'}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                Visual Analysis
              </h3>
              <div className="mt-5 grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-line bg-panel p-4">
                  <h4 className="text-lg font-semibold text-ink">Opportunity Mix</h4>
                  <div className="mt-4 h-80 w-full rounded-2xl border border-line bg-card p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visualAnalysisData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label
                        >
                          {visualAnalysisData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-panel p-4">
                  <h4 className="text-lg font-semibold text-ink">SWOT + Financial Breakdown</h4>
                  <div className="mt-4 h-80 w-full rounded-2xl border border-line bg-card p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={investorBarData} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis domain={[0, 100]} stroke="#9ca3af" />
                        <Tooltip />
                        <Bar dataKey="score" fill="#38bdf8" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">AI Analysis</h3>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-400">
                {aiAnalysisText}
              </p>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">Market Analysis</h3>
              <p className="mt-3 leading-7 text-slate-400">{marketAnalysisText}</p>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">Competitor Overview</h3>
              <p className="mt-3 leading-7 text-slate-400">{competitorOverviewText}</p>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">Risk Assessment</h3>
              <p className="mt-3 leading-7 text-slate-400">{riskAssessmentText}</p>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                Financial Projection
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-line bg-panel p-5">
                  <p className="text-sm text-slate-500">Initial Investment</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {formatCurrency(financialProjection.initialInvestment)}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-panel p-5">
                  <p className="text-sm text-slate-500">Monthly Cost</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {formatCurrency(financialProjection.monthlyCost)}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-panel p-5">
                  <p className="text-sm text-slate-500">Expected Monthly Revenue</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">
                    {formatCurrency(financialProjection.expectedRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-accent/25 bg-accent/10 p-5">
                  <p className="text-sm text-accent">Break-even Time</p>
                  <p className="mt-2 text-2xl font-bold text-accent">
                    {financialProjection.breakEvenMonths || 0} months
                  </p>
                </div>
                <div className="rounded-2xl border border-secondary/25 bg-secondary/10 p-5">
                  <p className="text-sm text-secondary">Yearly Profit</p>
                  <p className="mt-2 text-2xl font-bold text-secondary">
                    {formatCurrency(financialProjection.yearlyProfit)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                  Pitch Deck Summary
                </h3>
                <button
                  type="button"
                  onClick={handleCopyPitchDeck}
                  className="premium-button-secondary"
                >
                  {copied ? 'Copied' : 'Copy Pitch Deck'}
                </button>
              </div>
              <div className="mt-5 grid gap-4">
                {[
                  ['Problem', pitchDeck.problem],
                  ['Solution', pitchDeck.solution],
                  ['Target Market', pitchDeck.targetMarket],
                  ['Business Model', pitchDeck.businessModel],
                  ['Competition', pitchDeck.competition],
                  ['Financial Summary', pitchDeck.financialSummary],
                ].map(([title, value]) => (
                  <div key={title} className="rounded-2xl border border-line bg-panel p-5">
                    <h4 className="text-lg font-semibold text-ink">{title}</h4>
                    <p className="mt-2 leading-7 text-slate-400">{value}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-line bg-panel p-5">
                  <h4 className="text-lg font-semibold text-ink">Roadmap</h4>
                  <ol className="mt-3 list-decimal space-y-3 pl-5 text-slate-400">
                    {(pitchDeck.roadmap || []).map((item) => (
                      <li key={item} className="rounded-xl border border-line bg-card px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                SWOT Analysis
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {renderListSection('Strengths', swot.strengths, 'emerald')}
                {renderListSection('Weaknesses', swot.weaknesses, 'amber')}
                {renderListSection('Opportunities', swot.opportunities, 'slate')}
                {renderListSection('Threats', swot.threats, 'rose')}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                Score Summary
              </h3>
              <div className="mt-5 space-y-4">
                {[
                  ['Market Opportunity', report?.dimensionScores?.marketOpportunity],
                  ['Uniqueness', report?.dimensionScores?.uniqueness],
                  ['Scalability', report?.dimensionScores?.scalability],
                  ['Financial Viability', report?.dimensionScores?.financialViability],
                  ['Execution Complexity', report?.dimensionScores?.executionComplexity],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-line bg-panel p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-accent/25 bg-accent/10 p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                Suggestions
              </h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-300">
                {suggestionItems.map((suggestion) => (
                  <li key={suggestion} className="rounded-xl border border-line bg-card px-4 py-3">
                    {suggestion}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <h3 className="text-xl font-semibold uppercase tracking-[0.08em] text-ink">
                Business Model Canvas
              </h3>
              <div className="mt-5 grid gap-4">
                {renderListSection('Customer Segments', businessModel.customerSegments)}
                {renderListSection('Value Proposition', businessModel.valueProposition)}
                {renderListSection('Channels', businessModel.channels)}
                {renderListSection('Revenue Streams', businessModel.revenueStreams)}
                {renderListSection('Cost Structure', businessModel.costStructure)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportDetails
