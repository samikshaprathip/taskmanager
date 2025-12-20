import crypto from 'crypto'
import Invite from '../model/inviteModel.js'
import Project from '../model/projectModel.js'
import User from '../model/userModel.js'
import Task from '../model/taskModel.js'
import nodemailer from 'nodemailer'
import mongoose from 'mongoose'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_SECURE = (process.env.SMTP_SECURE || '').toLowerCase() === 'true'
const SMTP_DEBUG = (process.env.SMTP_DEBUG || '').toLowerCase() === 'true'
// Prefer explicit EMAIL_FROM; fall back to SMTP_USER so the envelope sender matches the authenticated account.
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || 'samikshapp.23csd@kongu.edu'
const FRONTEND_BASE = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

const buildShareLink = (project) => `${FRONTEND_BASE}/invite/accept/${project.inviteToken}`

const getRole = (project, userId) => {
  if(!project) return null
  const ownerId = project.owner?._id || project.owner
  if(ownerId.toString() === userId.toString()) return 'owner'
  const member = (project.members || []).find(m => {
    const membUserId = m.user?._id || m.user
    return membUserId.toString() === userId.toString()
  })
  return member ? member.role : null
}

async function sendInviteEmail(email, acceptUrl){
  let transporter
  let fromAddress = EMAIL_FROM

  if(!SMTP_HOST || !SMTP_USER || !SMTP_PASS){
    // Development fallback: create an Ethereal test account so email
    // sending works without real SMTP credentials.
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    })
    fromAddress = fromAddress || `TaskManager <${testAccount.user}>`
    console.warn('SMTP not configured. Using Ethereal test account for invites.')
  } else {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || (SMTP_SECURE ? 465 : 587),
      secure: SMTP_SECURE || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
  }

  // Optional detailed SMTP diagnostics
  if(SMTP_DEBUG){
    transporter.set('logger', true)
    transporter.set('debug', true)
  }

  // Verify SMTP connection if configured, logs helpful errors without crashing invite flow
  try{
    await transporter.verify()
    console.log('SMTP connection verified')
  }catch(verifyErr){
    console.warn('SMTP verify failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr)
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'You are invited to collaborate',
    text: `You have been invited. Accept: ${acceptUrl}`,
    html: `<p>You have been invited to collaborate.</p><p><a href="${acceptUrl}">Accept invite</a></p>`
  })

  console.log('Invite email sent:', info.messageId)
  let previewUrl = null
  try{ previewUrl = nodemailer.getTestMessageUrl(info) }catch(e){}
  if(previewUrl) console.log('Preview URL:', previewUrl)
  return previewUrl
}

export async function inviteMember(req, res){
  try{
    const { projectId, email, role } = req.body
    if(!projectId || !email) return res.status(400).json({ success:false, message: 'projectId and email required' })
    if(!mongoose.Types.ObjectId.isValid(projectId)){
      return res.status(400).json({ success:false, message: 'Invalid projectId' })
    }

    const project = await Project.findById(projectId)
    if(!project) return res.status(404).json({ success:false, message: 'Project not found' })
    if(project.owner.toString() !== req.user.id.toString()) return res.status(403).json({ success:false, message:'Only owner can invite' })

    const token = crypto.randomBytes(20).toString('hex')
    const invite = await Invite.create({ email, project: projectId, token, invitedBy: req.user.id, expiresAt: new Date(Date.now() + 7*24*3600*1000) })

    const acceptUrl = `${FRONTEND_BASE}/invite/accept/${invite.token}`
    let preview = null
    try{
      preview = await sendInviteEmail(email, acceptUrl)
    }catch(sendErr){
      // Do not block invite creation if email fails; the share link still works.
      console.error('sendInviteEmail failed (continuing without email):', sendErr)
    }

    const resp = { id: invite._id, email: invite.email, token: invite.token, acceptUrl }
    if(preview) resp.preview = preview
    res.json({ success:true, invite: resp })
  }catch(err){
    console.error('inviteMember error', err)
    res.status(500).json({ success:false, message: err?.message || 'Server error' })
  }
}

export async function acceptInvite(req, res){
  try{
    const token = req.params.token || req.body.token
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })

    const invite = await Invite.findOne({ token })
    const project = invite ? await Project.findById(invite.project) : await Project.findOne({ inviteToken: token })
    if(!project) return res.status(404).json({ success:false, message:'Invite not found' })

    if(invite){
      if(invite.status !== 'pending') return res.status(400).json({ success:false, message:'Invite not pending' })
      if(invite.expiresAt && invite.expiresAt < new Date()) return res.status(400).json({ success:false, message:'Invite expired' })
    } else if(!project.inviteToken || project.inviteToken !== token){
      return res.status(400).json({ success:false, message:'Link not active' })
    }

    if(!req.user) return res.status(401).json({ success:false, message:'Authentication required to accept invite' })

    const already = project.members.find(m=>m.user.toString()===req.user.id.toString()) || project.owner.toString() === req.user.id.toString()
    if(!already){
      project.members.push({ user: req.user.id, role: 'editor' })
      await project.save()
    }

    if(invite){
      invite.status = 'accepted'
      await invite.save()
    }

    res.json({ success:true, project })
  }catch(err){
    console.error('acceptInvite error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function listProjects(req, res){
  try{
    const projects = await Project.find({ $or: [ { owner: req.user.id }, { 'members.user': req.user.id } ] })
      .populate('owner','name email avatar')
      .populate('members.user','name email avatar')
      .lean()
    res.json({ success:true, projects })
  }catch(err){
    console.error('listProjects error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function createProject(req, res){
  try{
    const { name } = req.body
    if(!name) return res.status(400).json({ success:false, message:'Name required' })
    const token = crypto.randomBytes(20).toString('hex')
    let project = await Project.create({ name, owner: req.user.id, members: [ { user: req.user.id, role: 'owner' } ], inviteToken: token, inviteTokenCreatedAt: new Date() })
    project = await project.populate('owner','name email avatar')
    project = await project.populate('members.user','name email avatar')
    res.status(201).json({ success:true, project })
  }catch(err){
    console.error('createProject error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function getProject(req, res){
  try{
    const { id } = req.params
    const project = await Project.findById(id)
      .populate('owner','name email avatar')
      .populate('members.user','name email avatar')
      .lean()
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })
    const role = getRole(project, req.user.id)
    if(!role) return res.status(403).json({ success:false, message:'Not a project member' })

    const invites = project.owner._id?.toString() === req.user.id.toString() || project.owner.toString() === req.user.id.toString()
      ? await Invite.find({ project: id, status: 'pending' }).select('email status createdAt token')
      : []

    res.json({ success:true, project, invites, shareLink: project.inviteToken ? buildShareLink(project) : null })
  }catch(err){
    console.error('getProject error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function getShareLink(req, res){
  try{
    const { id } = req.params
    const project = await Project.findById(id)
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })
    if(project.owner.toString() !== req.user.id.toString()) return res.status(403).json({ success:false, message:'Only owner can manage share link' })

    if(!project.inviteToken){
      project.inviteToken = crypto.randomBytes(20).toString('hex')
      project.inviteTokenCreatedAt = new Date()
      await project.save()
    }

    res.json({ success:true, shareLink: buildShareLink(project), inviteToken: project.inviteToken, createdAt: project.inviteTokenCreatedAt })
  }catch(err){
    console.error('getShareLink error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function resetShareLink(req, res){
  try{
    const { id } = req.params
    const project = await Project.findById(id)
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })
    if(project.owner.toString() !== req.user.id.toString()) return res.status(403).json({ success:false, message:'Only owner can reset link' })

    project.inviteToken = crypto.randomBytes(20).toString('hex')
    project.inviteTokenCreatedAt = new Date()
    await project.save()

    res.json({ success:true, shareLink: buildShareLink(project), inviteToken: project.inviteToken, createdAt: project.inviteTokenCreatedAt })
  }catch(err){
    console.error('resetShareLink error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function deleteProject(req, res){
  try{
    const { id } = req.params
    const project = await Project.findById(id)
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })
    if(project.owner.toString() !== req.user.id.toString()) return res.status(403).json({ success:false, message:'Only owner can delete' })

    await Project.findByIdAndDelete(id)
    await Invite.deleteMany({ project: id })
    await Task.deleteMany({ project: id })

    res.json({ success:true, message:'Project deleted successfully' })
  }catch(err){
    console.error('deleteProject error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

// Guest/Anonymous access endpoints
export async function getGuestProject(req, res){
  try{
    const { token } = req.params
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })

    const invite = await Invite.findOne({ token })
    const project = invite ? await Project.findById(invite.project) : await Project.findOne({ inviteToken: token })
    
    if(!project) return res.status(404).json({ success:false, message:'Invite not found' })

    if(invite){
      if(invite.status !== 'pending') return res.status(400).json({ success:false, message:'Invite not pending' })
      if(invite.expiresAt && invite.expiresAt < new Date()) return res.status(400).json({ success:false, message:'Invite expired' })
    } else if(!project.inviteToken || project.inviteToken !== token){
      return res.status(400).json({ success:false, message:'Link not active' })
    }

    const populatedProject = await Project.findById(project._id)
      .populate('owner','name email avatar')
      .populate('members.user','name email avatar')
      .lean()

    res.json({ success:true, project: populatedProject })
  }catch(err){
    console.error('getGuestProject error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function getGuestTasks(req, res){
  try{
    const { token } = req.params
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })

    const invite = await Invite.findOne({ token })
    const project = invite ? await Project.findById(invite.project) : await Project.findOne({ inviteToken: token })
    
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })

    const tasks = await Task.find({ project: project._id }).lean()
    res.json({ success:true, tasks })
  }catch(err){
    console.error('getGuestTasks error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function createGuestTask(req, res){
  try{
    const { token } = req.params
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })

    const invite = await Invite.findOne({ token })
    const project = invite ? await Project.findById(invite.project) : await Project.findOne({ inviteToken: token })
    
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })

    const { title, description, dueDate, priority, tags, completed } = req.body
    // Guest-created tasks are attributed to the project owner to satisfy the required owner field.
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority: priority || 'Medium',
      tags: tags || [],
      completed: completed || false,
      project: project._id,
      owner: project.owner
    })

    res.status(201).json({ success:true, task })
  }catch(err){
    console.error('createGuestTask error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function updateGuestTask(req, res){
  try{
    const { token, taskId } = req.params
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })

    const invite = await Invite.findOne({ token })
    const project = invite ? await Project.findById(invite.project) : await Project.findOne({ inviteToken: token })
    
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })

    const task = await Task.findById(taskId)
    if(!task) return res.status(404).json({ success:false, message:'Task not found' })
    if(task.project.toString() !== project._id.toString()) {
      return res.status(403).json({ success:false, message:'Task not in this project' })
    }

    const { title, description, dueDate, priority, tags, completed } = req.body
    const updates = {}
    if(title !== undefined) updates.title = title
    if(description !== undefined) updates.description = description
    if(dueDate !== undefined) updates.dueDate = dueDate
    if(priority !== undefined) updates.priority = priority
    if(tags !== undefined) updates.tags = tags
    if(completed !== undefined) updates.completed = completed

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true })
    res.json({ success:true, task: updatedTask })
  }catch(err){
    console.error('updateGuestTask error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function deleteGuestTask(req, res){
  try{
    const { token, taskId } = req.params
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })

    const invite = await Invite.findOne({ token })
    const project = invite ? await Project.findById(invite.project) : await Project.findOne({ inviteToken: token })
    
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })

    const task = await Task.findById(taskId)
    if(!task) return res.status(404).json({ success:false, message:'Task not found' })
    if(task.project.toString() !== project._id.toString()) {
      return res.status(403).json({ success:false, message:'Task not in this project' })
    }

    await Task.findByIdAndDelete(taskId)
    res.json({ success:true, message:'Task deleted successfully' })
  }catch(err){
    console.error('deleteGuestTask error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}
