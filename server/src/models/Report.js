import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Idea',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    dimensionScores: {
      marketOpportunity: {
        type: Number,
        required: true,
      },
      uniqueness: {
        type: Number,
        required: true,
      },
      scalability: {
        type: Number,
        required: true,
      },
      financialViability: {
        type: Number,
        required: true,
      },
      executionComplexity: {
        type: Number,
        required: true,
      },
    },
    marketAnalysis: {
      type: String,
      required: true,
    },
    competitorOverview: {
      type: String,
      required: true,
    },
    aiAnalysis: {
      type: String,
      default: '',
    },
    aiText: {
      type: String,
      default: '',
    },
    riskAssessment: {
      type: String,
      required: true,
    },
    suggestions: {
      type: [String],
      default: [],
    },
    swot: {
      strengths: {
        type: [String],
        default: [],
      },
      weaknesses: {
        type: [String],
        default: [],
      },
      opportunities: {
        type: [String],
        default: [],
      },
      threats: {
        type: [String],
        default: [],
      },
    },
    businessModel: {
      customerSegments: {
        type: [String],
        default: [],
      },
      valueProposition: {
        type: [String],
        default: [],
      },
      channels: {
        type: [String],
        default: [],
      },
      revenueStreams: {
        type: [String],
        default: [],
      },
      costStructure: {
        type: [String],
        default: [],
      },
    },
    businessModelCanvas: {
      customerSegments: {
        type: [String],
        default: [],
      },
      valueProposition: {
        type: [String],
        default: [],
      },
      channels: {
        type: [String],
        default: [],
      },
      revenueStreams: {
        type: [String],
        default: [],
      },
      costStructure: {
        type: [String],
        default: [],
      },
    },
    financialProjection: {
      initialInvestment: {
        type: Number,
        default: 0,
      },
      monthlyCost: {
        type: Number,
        default: 0,
      },
      expectedRevenue: {
        type: Number,
        default: 0,
      },
      breakEvenMonths: {
        type: Number,
        default: 0,
      },
      yearlyProfit: {
        type: Number,
        default: 0,
      },
    },
    pitchDeck: {
      problem: {
        type: String,
        default: '',
      },
      solution: {
        type: String,
        default: '',
      },
      targetMarket: {
        type: String,
        default: '',
      },
      businessModel: {
        type: String,
        default: '',
      },
      competition: {
        type: String,
        default: '',
      },
      financialSummary: {
        type: String,
        default: '',
      },
      roadmap: {
        type: [String],
        default: [],
      },
    },
    investorInsights: {
      fundingRequired: {
        type: Number,
        default: 0,
      },
      roiEstimate: {
        type: Number,
        default: 0,
      },
      riskLevel: {
        type: String,
        default: 'Medium',
      },
      growthPotential: {
        type: String,
        default: 'Medium',
      },
    },
  },
  {
    timestamps: true,
  },
)

const Report = mongoose.model('Report', reportSchema)

export default Report
