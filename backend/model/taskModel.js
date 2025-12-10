 import mongoose from 'mongoose';
 const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    priority:{
        type: String,
        enum: ['Low', 'Medium', 'High'], default: 'Low'
    },
    dueDate: {
        type: Date
    },
    tags: [{ type: String }],
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: { type: Date },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model.Task || mongoose.model('Task', taskSchema);
export default Task;