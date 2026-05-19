import mongoose from 'mongoose'

mongoose.set('bufferCommands', false)

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables')
  }

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
  })

  console.log('MongoDB connected')
  return connection
}

export default connectDB
