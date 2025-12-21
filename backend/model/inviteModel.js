import mongoose from 'mongoose'

const InviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  token: { type: String, required: true, unique: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','accepted','revoked'], default: 'pending' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Invite', InviteSchema)


