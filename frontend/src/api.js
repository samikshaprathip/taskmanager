// For local development ensure the frontend points to the local backend API.
// You can override by setting VITE_API_URL in `frontend/.env` or Netlify envs.
// To be resilient, ensure the base always ends with '/api' even if misconfigured.
let __base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
if (!/\/api\/?$/.test(__base)) {
  __base = __base.replace(/\/+$/, '') + '/api'
}
const BASE = __base

const PREVIEW_TOKEN = '__preview__'

// Mock data for UI preview without backend
const MOCK_TASKS = [
  { _id: 'm1', title: 'Review design mockups', description: 'Check the new dashboard UI', dueDate: new Date().toISOString(), completed: false, priority: 'High', createdAt: new Date().toISOString() },
  { _id: 'm2', title: 'Team standup meeting', description: 'Daily sync at 10 AM', dueDate: new Date(Date.now() + 86400000).toISOString(), completed: true, priority: 'Medium', completedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { _id: 'm3', title: 'Update documentation', description: 'Add API changelog', dueDate: null, completed: false, priority: 'Low', createdAt: new Date().toISOString() },
]
const MOCK_PROJECTS = [
  { _id: 'p1', name: 'Demo Project', owner: { _id: 'demo', name: 'Demo User' }, members: [], createdAt: new Date().toISOString() },
]
const MOCK_PROJECT_DETAIL = { _id: 'p1', name: 'Demo Project', owner: { _id: 'demo', name: 'Demo User' }, members: [], shareLink: 'https://taskdrive.app/invite/accept/demo-link', invites: [], createdAt: new Date().toISOString() }

function isPreview(token) {
  return token === PREVIEW_TOKEN
}

async function request(path, options = {}){
  const url = `${BASE}${path}`
  try{
    const res = await fetch(url, options)
    const data = await res.json().catch(()=> ({}))
    if(!res.ok){
      const errMsg = data?.message || data?.error || (typeof data === 'string' ? data : JSON.stringify(data)) || 'Request failed'
      throw new Error(errMsg)
    }
    return data
  }catch(err){
    // Helpful console output for debugging "Failed to fetch" in the browser
    console.error('API request failed', { url, options, err })
    throw err
  }
}

export const auth = {
  register: (payload) => request('/user/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }),
  login: (payload) => request('/user/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }),
  me: (token) => isPreview(token) ? Promise.resolve({ user: { _id: 'demo', name: 'Demo User', email: 'demo@taskdrive.app' } }) : request('/user/me', { headers: { Authorization: `Bearer ${token}` }}),
  updateProfile: (token, payload) => isPreview(token) ? Promise.resolve({ user: { _id: 'demo', name: payload?.name || 'Demo User', email: payload?.email || 'demo@taskdrive.app' } }) : request('/user/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
}

export const tasks = {
  list: (token, query = '') => isPreview(token) ? Promise.resolve({ tasks: MOCK_TASKS }) : request(`/tasks/gp${query}`, { headers: { Authorization: `Bearer ${token}` }}),
  create: (token, payload) => isPreview(token) ? Promise.resolve({ task: { _id: 'm' + Date.now(), ...payload, completed: false, createdAt: new Date().toISOString() } }) : request('/tasks/gp', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  update: (token, id, payload) => isPreview(token) ? Promise.resolve({ task: { _id: id, ...MOCK_TASKS[0], ...payload } }) : request(`/tasks/${id}/gp`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  remove: (token, id) => isPreview(token) ? Promise.resolve({}) : request(`/tasks/${id}/gp`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  get: (token, id) => isPreview(token) ? Promise.resolve({ task: MOCK_TASKS[0] }) : request(`/tasks/${id}/gp`, { headers: { Authorization: `Bearer ${token}` } })
}

export const collab = {
  invite: (token, payload) => isPreview(token) ? Promise.resolve({ success: true }) : request('/collab/invite', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  accept: (token, payload) => request('/collab/accept', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  listProjects: (token) => isPreview(token) ? Promise.resolve({ projects: MOCK_PROJECTS }) : request('/collab/projects', { headers: { Authorization: `Bearer ${token}` } }),
  createProject: (token, payload) => isPreview(token) ? Promise.resolve({ project: { _id: 'p' + Date.now(), name: payload?.name || 'New Project', owner: { _id: 'demo', name: 'Demo User' }, members: [], createdAt: new Date().toISOString() } }) : request('/collab/projects', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  getProject: (token, id) => isPreview(token) ? Promise.resolve({ project: { ...MOCK_PROJECT_DETAIL, _id: id }, shareLink: MOCK_PROJECT_DETAIL.shareLink, invites: [] }) : request(`/collab/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  getShareLink: (token, id) => isPreview(token) ? Promise.resolve({ shareLink: MOCK_PROJECT_DETAIL.shareLink }) : request(`/collab/projects/${id}/share`, { headers: { Authorization: `Bearer ${token}` } }),
  resetShareLink: (token, id) => isPreview(token) ? Promise.resolve({ shareLink: MOCK_PROJECT_DETAIL.shareLink }) : request(`/collab/projects/${id}/share/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  deleteProject: (token, id) => isPreview(token) ? Promise.resolve({}) : request(`/collab/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  
  // Guest/Anonymous APIs
  getGuestProject: (inviteToken) => request(`/collab/guest/${inviteToken}/project`),
  getGuestTasks: (inviteToken) => request(`/collab/guest/${inviteToken}/tasks`),
  createGuestTask: (inviteToken, payload) => request(`/collab/guest/${inviteToken}/tasks`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  updateGuestTask: (inviteToken, taskId, payload) => request(`/collab/guest/${inviteToken}/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  deleteGuestTask: (inviteToken, taskId) => request(`/collab/guest/${inviteToken}/tasks/${taskId}`, { method: 'DELETE' })
}

export default { auth, tasks }
