import crypto from 'crypto'
import Invite from '../model/inviteModel.js'
import Project from '../model/projectModel.js'
import User from '../model/userModel.js'
import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com'

async function sendInviteEmail(email, acceptUrl){
  // If SMTP not configured, create an Ethereal test account so developers can preview the email
  let transporter
  let previewUrl = null
  if(!SMTP_HOST || !SMTP_USER){
    console.log('No SMTP configured — creating Ethereal test account for preview')
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({ host: testAccount.smtp.host, port: testAccount.smtp.port, secure: testAccount.smtp.secure, auth: { user: testAccount.user, pass: testAccount.pass } })
  } else {
    transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 587, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  }

  const info = await transporter.sendMail({ from: EMAIL_FROM, to: email, subject: 'You are invited', text: `You have been invited. Accept: ${acceptUrl}`, html: `<p>You have been invited. <a href="${acceptUrl}">Accept invite</a></p>` })
  console.log('Invite email sent:', info.messageId)
  try{ previewUrl = nodemailer.getTestMessageUrl(info) }catch(e){}
  if(previewUrl) console.log('Preview URL:', previewUrl)
  return previewUrl
}

export async function inviteMember(req, res){
  try{
    const { projectId, email, role } = req.body
    if(!projectId || !email) return res.status(400).json({ success:false, message: 'projectId and email required' })

    const project = await Project.findById(projectId)
    if(!project) return res.status(404).json({ success:false, message: 'Project not found' })
    // only owner can invite
    if(project.owner.toString() !== req.user.id.toString()) return res.status(403).json({ success:false, message:'Only owner can invite' })

    const token = crypto.randomBytes(20).toString('hex')
    const invite = await Invite.create({ email, project: projectId, token, invitedBy: req.user.id, expiresAt: new Date(Date.now() + 7*24*3600*1000) })

    const acceptUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/invite/accept/${invite.token}`
    let preview = null
    try{
      preview = await sendInviteEmail(email, acceptUrl)
    }catch(sendErr){
      console.error('sendInviteEmail failed', sendErr)
      // don't fail the entire request if email sending fails; return the invite token so the link can be shared manually
    }

    const resp = { id: invite._id, email: invite.email, token: invite.token }
    if(preview) resp.preview = preview
    res.json({ success:true, invite: resp })
  }catch(err){
    console.error('inviteMember error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function acceptInvite(req, res){
  try{
    const token = req.params.token || req.body.token
    if(!token) return res.status(400).json({ success:false, message:'Missing token' })
    const invite = await Invite.findOne({ token })
    if(!invite) return res.status(404).json({ success:false, message:'Invite not found' })
    if(invite.status !== 'pending') return res.status(400).json({ success:false, message:'Invite not pending' })
    if(invite.expiresAt && invite.expiresAt < new Date()) return res.status(400).json({ success:false, message:'Invite expired' })

    // require auth
    if(!req.user) return res.status(401).json({ success:false, message:'Authentication required to accept invite' })

    // add member to project if not present
    const project = await Project.findById(invite.project)
    if(!project) return res.status(404).json({ success:false, message:'Project not found' })
    const already = project.members.find(m=>m.user.toString()===req.user.id.toString())
    if(!already){
      project.members.push({ user: req.user.id, role: 'editor' })
      await project.save()
    }
    invite.status = 'accepted'
    await invite.save()
    res.json({ success:true, project })
  }catch(err){
    console.error('acceptInvite error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}

export async function listProjects(req, res){
  try{
    const projects = await Project.find({ $or: [ { owner: req.user.id }, { 'members.user': req.user.id } ] }).populate('owner','name email').lean()
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
    const project = await Project.create({ name, owner: req.user.id, members: [ { user: req.user.id, role: 'owner' } ] })
    res.status(201).json({ success:true, project })
  }catch(err){
    console.error('createProject error', err)
    res.status(500).json({ success:false, message:'Server error' })
  }
}
