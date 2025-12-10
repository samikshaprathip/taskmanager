import express from 'express'
import { inviteMember, acceptInvite, listProjects, createProject } from '../controllers/collabController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.post('/invite', authMiddleware, inviteMember)
router.post('/accept', authMiddleware, acceptInvite)
router.post('/projects', authMiddleware, createProject)
router.get('/projects', authMiddleware, listProjects)
router.get('/accept/:token', authMiddleware, acceptInvite)

export default router
