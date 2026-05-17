import mongoose from 'mongoose'

const ideaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'analyzed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
)

const Idea = mongoose.model('Idea', ideaSchema)

export default Idea
