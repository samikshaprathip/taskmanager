import mongoose from 'mongoose'

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner','editor','viewer'], default: 'viewer' }
}, { _id: false })

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [MemberSchema],
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Project', ProjectSchema)
