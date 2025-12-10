import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { collab as collabApi } from '../api'
import { toast } from 'react-toastify'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function AcceptInvite(){
  const { token } = useParams()
  const { user, token: authToken } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    async function accept(){
      if(!authToken){
        toast.info('Please sign in to accept the invite')
        // Store the invite token to redirect back after login
        sessionStorage.setItem('pendingInvite', token)
        navigate('/')
        return
      }
      
      setLoading(true)
      try{
        const res = await collabApi.accept(authToken, { token })
        setSuccess(true)
        toast.success(`You've joined the project!`)
        setTimeout(() => navigate('/collaboration'), 2000)
      }catch(err){
        setError(err.message || 'Failed to accept invite')
        toast.error(err.message || 'Failed to accept invite')
      }finally{ 
        setLoading(false) 
      }
    }
    accept()
  }, [authToken, token, navigate])

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center">
        {loading ? (
          <>
            <Loader className="mx-auto mb-4 text-blue-600 animate-spin" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accepting invite...</h2>
            <p className="text-gray-600">Please wait while we add you to the project.</p>
          </>
        ) : success ? (
          <>
            <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">You've been added to the project.</p>
            <p className="text-sm text-gray-500">Redirecting to collaboration page...</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to accept invite</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/collaboration')} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Collaboration
            </button>
          </>
        )}
      </div>
    </div>
  )
}
