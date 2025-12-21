import express from 'express'
import { inviteMember, acceptInvite, listProjects, createProject, getProject, getShareLink, resetShareLink, deleteProject, getGuestProject, getGuestTasks, createGuestTask, updateGuestTask, deleteGuestTask } from '../controllers/collabController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.post('/invite', authMiddleware, inviteMember)
router.post('/accept', authMiddleware, acceptInvite)
router.post('/projects', authMiddleware, createProject)
router.get('/projects', authMiddleware, listProjects)
router.get('/projects/:id', authMiddleware, getProject)
router.get('/projects/:id/share', authMiddleware, getShareLink)
router.post('/projects/:id/share/reset', authMiddleware, resetShareLink)
router.delete('/projects/:id', authMiddleware, deleteProject)
router.get('/accept/:token', authMiddleware, acceptInvite)

router.get('/guest/:token/project', getGuestProject)
router.get('/guest/:token/tasks', getGuestTasks)
router.post('/guest/:token/tasks', createGuestTask)
router.put('/guest/:token/tasks/:taskId', updateGuestTask)
router.delete('/guest/:token/tasks/:taskId', deleteGuestTask)

export default router
