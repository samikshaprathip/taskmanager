// For local development ensure the frontend points to the local backend API.
// You can override by setting VITE_API_URL in `frontend/.env` or Netlify envs.
// To be resilient, ensure the base always ends with '/api' even if misconfigured.
let __base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
if (!/\/api\/?$/.test(__base)) {
  __base = __base.replace(/\/+$/, '') + '/api'
}
const BASE = __base

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
  me: (token) => request('/user/me', { headers: { Authorization: `Bearer ${token}` }}),
  updateProfile: (token, payload) => request('/user/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
}

export const tasks = {
  list: (token, query = '') => request(`/tasks/gp${query}`, { headers: { Authorization: `Bearer ${token}` }}),
  create: (token, payload) => request('/tasks/gp', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  update: (token, id, payload) => request(`/tasks/${id}/gp`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  remove: (token, id) => request(`/tasks/${id}/gp`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  get: (token, id) => request(`/tasks/${id}/gp`, { headers: { Authorization: `Bearer ${token}` } })
}

export const collab = {
  invite: (token, payload) => request('/collab/invite', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  accept: (token, payload) => request('/collab/accept', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  listProjects: (token) => request('/collab/projects', { headers: { Authorization: `Bearer ${token}` } }),
  createProject: (token, payload) => request('/collab/projects', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  getProject: (token, id) => request(`/collab/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  getShareLink: (token, id) => request(`/collab/projects/${id}/share`, { headers: { Authorization: `Bearer ${token}` } }),
  resetShareLink: (token, id) => request(`/collab/projects/${id}/share/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  deleteProject: (token, id) => request(`/collab/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  
  // Guest/Anonymous APIs
  getGuestProject: (inviteToken) => request(`/collab/guest/${inviteToken}/project`),
  getGuestTasks: (inviteToken) => request(`/collab/guest/${inviteToken}/tasks`),
  createGuestTask: (inviteToken, payload) => request(`/collab/guest/${inviteToken}/tasks`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  updateGuestTask: (inviteToken, taskId, payload) => request(`/collab/guest/${inviteToken}/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }),
  deleteGuestTask: (inviteToken, taskId) => request(`/collab/guest/${inviteToken}/tasks/${taskId}`, { method: 'DELETE' })
}

export default { auth, tasks }
