import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 AuthCallback: Handling auth callback')
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('🔐 AuthCallback: Error getting session:', error)
          navigate('/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          console.log('🔐 AuthCallback: Session found, redirecting to home')
          navigate('/')
        } else {
          console.log('🔐 AuthCallback: No session, redirecting to login')
          navigate('/login')
        }
      } catch (err) {
        console.error('🔐 AuthCallback: Unexpected error:', err)
        navigate('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Confirming your email...</h2>
        <p className="text-gray-500">Please wait while we verify your account.</p>
      </div>
    </div>
  )
}

export default AuthCallback