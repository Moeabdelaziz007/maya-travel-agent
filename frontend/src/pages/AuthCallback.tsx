import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the URL hash and search params
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      // Check for auth callback parameters
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const error = hashParams.get('error') || searchParams.get('error');
      const errorDescription =
        hashParams.get('error_description') ||
        searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(
          errorDescription || 'An error occurred during authentication'
        );
        return;
      }

      if (accessToken && refreshToken) {
        // Set the session manually
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setStatus('error');
          setMessage(sessionError.message);
          return;
        }

        if (data.session && data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! Welcome to Maya Trips!');
          setUser(data.user);

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Failed to create session');
        }
      } else {
        // Check if user is already authenticated
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setStatus('error');
          setMessage(sessionError.message);
          return;
        }

        if (session && session.user) {
          setStatus('success');
          setMessage('You are already signed in!');
          setUser(session.user);

          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No valid session found. Please try signing up again.');
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleRetry = () => {
    navigate('/auth/signup', { replace: true });
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6 text-blue-500"
            >
              <Loader2 className="w-16 h-16" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Confirming Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we confirm your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 text-green-500"
            >
              <CheckCircle className="w-16 h-16" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Email Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Welcome, {user.user_metadata?.full_name || user.email}!
                  </span>
                </div>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <button
                onClick={handleGoHome}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-500">
                Redirecting automatically in a few seconds...
              </p>
            </motion.div>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 text-red-500"
            >
              <XCircle className="w-16 h-16" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Confirmation Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">
                Possible reasons:
              </h3>
              <ul className="text-red-700 text-sm space-y-1 text-left">
                <li>• The confirmation link has expired</li>
                <li>• The link has already been used</li>
                <li>• There was a network error</li>
                <li>• The email address is already confirmed</li>
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Signing Up Again
              </button>
              <button
                onClick={handleGoHome}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </button>
            </motion.div>
          </>
        )}

        {/* Support Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@mayatrips.com"
              className="text-blue-600 hover:underline"
            >
              support@mayatrips.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
