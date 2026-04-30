import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);