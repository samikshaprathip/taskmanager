// For local development ensure the frontend points to the local backend API.
// You can override by setting VITE_API_URL in `frontend/.env` if needed.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

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
  listProjects: (token) => request('/collab/projects', { headers: { Authorization: `Bearer ${token}` } })
}

// add create project helper
export const collabCreate = {
  createProject: (token, payload) => request('/collab/projects', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
}

export default { auth, tasks }
