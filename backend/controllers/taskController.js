import Task from "../model/taskModel.js";
import Project from "../model/projectModel.js";


export const createTask = async (req, res) => {
    try{
        const { title, description, priority, dueDate, completed, project } = req.body;
        
        // If project is specified, verify user has access
        if(project){
            const proj = await Project.findById(project);
            if(!proj) return res.status(404).json({success: false, message: 'Project not found'});
            const isMember = proj.owner.toString() === req.user.id.toString() || 
                           proj.members.some(m => m.user.toString() === req.user.id.toString());
            if(!isMember) return res.status(403).json({success: false, message: 'Not a project member'});
        }
        
        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            completed: completed === 'Yes' || completed === true,
            owner: req.user.id,
            project: project || null
    });
    const saved = await task.save();
    res.status(201).json({success: true, task: saved});
}
catch(err){
    res.status(400).json({success: false, message: err.message});
}
};

export const getTasks = async (req, res) => {
    try{
        const { projectId } = req.query;
        
        // If projectId specified, return only tasks for that project (if user is member)
        if(projectId){
            const project = await Project.findById(projectId);
            if(!project) return res.status(404).json({success: false, message: 'Project not found'});
            const isMember = project.owner.toString() === req.user.id.toString() || 
                           project.members.some(m => m.user.toString() === req.user.id.toString());
            if(!isMember) return res.status(403).json({success: false, message: 'Not a project member'});
            
            const tasks = await Task.find({ project: projectId }).sort({ createdAt: -1 });
            return res.json({success: true, tasks});
        }
        
        // Otherwise return user's personal tasks (no project) + tasks from projects they're in
        const userProjects = await Project.find({
            $or: [ { owner: req.user.id }, { 'members.user': req.user.id } ]
        }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        
        const tasks = await Task.find({
            $or: [
                { owner: req.user.id, project: null },
                { project: { $in: projectIds } }
            ]
        }).sort({ createdAt: -1 });
        res.json({success: true, tasks});
    }
    catch(err){
        res.status(500).json({success: false, message: err.message});
    }
}

export const getTaskById = async (req, res) => {
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
        if(!task) return res.status(404).json({success: false, message: 'Task not found'});
        res.json({success: true, task});
    }
    catch(err){
         res.status(500).json({success: false, message: err.message});
    }
}

export const updateTask = async (req, res) => {
    try{
        const data = { ...req.body };

        // Special actions: commentText, addTag, removeTag
        if(typeof data.commentText !== 'undefined'){
            // push a comment with the current user as author
            const updated = await Task.findOneAndUpdate(
                { _id: req.params.id, owner: req.user.id },
                { $push: { comments: { author: req.user.id, text: data.commentText } } },
                { new: true }
            ).populate('comments.author', 'name email avatar')
            if(!updated) return res.status(404).json({success: false, message: 'Task not found'});
            return res.json({success: true, task: updated});
        }

        if(typeof data.addTag !== 'undefined'){
            const tag = String(data.addTag).trim()
            const updated = await Task.findOneAndUpdate(
                { _id: req.params.id, owner: req.user.id },
                { $addToSet: { tags: tag } },
                { new: true }
            )
            if(!updated) return res.status(404).json({success: false, message: 'Task not found'});
            return res.json({success: true, task: updated});
        }

        if(typeof data.removeTag !== 'undefined'){
            const tag = String(data.removeTag)
            const updated = await Task.findOneAndUpdate(
                { _id: req.params.id, owner: req.user.id },
                { $pull: { tags: tag } },
                { new: true }
            )
            if(!updated) return res.status(404).json({success: false, message: 'Task not found'});
            return res.json({success: true, task: updated});
        }

        if(data.completed !== undefined){
            data.completed = data.completed === 'Yes' || data.completed === true;
            // set completedAt timestamp when marking completed, clear when un-marking
            data.completedAt = data.completed ? new Date() : null
        }

        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            data,
            { new: true , runValidators: true }
        );
    if(!updated) return res.status(404).json({success: false, message: 'Task not found'});
    res.json({success: true, task: updated});
}
catch(err){
     res.status(400).json({success: false, message: err.message});
}
}

export const deleteTask = async (req, res) => {
    try{
        const deleted = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if(!deleted) return res.status(404).json({success: false, message: 'Task not found'});
        res.json({success: true, message: 'Task deleted successfully'});
    }
    catch(err){
            res.status(500).json({success: false, message: err.message});
    }
}