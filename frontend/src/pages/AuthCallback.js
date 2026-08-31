import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';

function AuthCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          setError('Authentication failed. Please try again.');
          return;
        }

        if (!token) {
          setError('No authentication token received.');
          return;
        }

        // Store token
        setToken(token);

        // Fetch user data
        const { data } = await authAPI.getCurrentUser();
        if (data.success) {
          setUser(data.user);
        }

        // Redirect to dashboard
        navigate('/repositories');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to complete authentication.');
      }
    };

    handleCallback();
  }, [navigate, setToken, setUser]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Go Home
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-400 mb-4" />
            <p className="text-slate-300">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
