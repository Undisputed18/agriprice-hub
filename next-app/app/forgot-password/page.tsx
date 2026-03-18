// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        if (error.includes('rate limit') || error.includes('Too Many Requests') || error.includes('429')) {
          setMessage({ 
            type: 'error', 
            text: 'Rate limit exceeded. Please wait 15-30 minutes before trying again.' 
          });
        } else {
          setMessage({ type: 'error', text: error });
        }
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Check your email! We have sent you a reset link and a 6-digit code.' 
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/login" className="inline-flex items-center text-green-600 hover:text-green-700">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
            <p className="text-gray-600 mt-2">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              {message && (
                <div className={`mb-6 p-4 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700 shadow-inner'
                }`}>
                  <p className="font-bold mb-1">{message.type === 'success' ? 'Success!' : 'Notice:'}</p>
                  <p>{message.text}</p>
                  
                  {message.type === 'success' && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="mb-3 text-green-800">
                        If the link in your email doesn't work, you can enter your 6-digit code manually:
                      </p>
                      <Link 
                        href="/reset-password" 
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-md hover:shadow-lg"
                      >
                        Go to Manual Reset Page
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Send Reset Link'}
                </button>
              </form>
              
              <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500 mb-2">Already have your 6-digit code?</p>
                <Link href="/reset-password" title="Go to reset page" className="text-green-600 font-bold hover:text-green-700 underline">
                  Enter Code Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
