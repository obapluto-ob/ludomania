'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);
    setLoading(true);

    try {
      console.log('🔵 Starting signup process...', { email, username });

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('🔵 Supabase auth response:', { authData, authError });

      if (authError) {
        setDebugInfo({ step: 'Auth Signup', error: authError });
        throw authError;
      }

      if (authData.user) {
        console.log('🔵 Creating profile for user:', authData.user.id);

        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          username,
          wallet_balance: 0,
        });

        console.log('🔵 Profile creation response:', { profileError });

        if (profileError) {
          setDebugInfo({ step: 'Profile Creation', error: profileError });
          throw profileError;
        }

        console.log('🔵 Sending notification email...');

        // Send notification email (API route will handle this)
        const emailResponse = await fetch('/api/user-registered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            userId: authData.user.id,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log('🔵 Email notification response:', emailResult);

        if (!emailResponse.ok) {
          setDebugInfo({ step: 'Email Notification', error: emailResult });
          console.warn('⚠️ Email notification failed but continuing...');
        }

        console.log('✅ Signup successful! Redirecting to dashboard...');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      setError(err.message || 'Failed to sign up');
      setDebugInfo((prev: any) => prev || { step: 'Unknown', error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        {/* Header with Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-700 rounded-lg p-1 flex">
            <Link
              href="/auth/login"
              className="px-6 py-2 rounded-md text-gray-300 hover:text-white transition"
            >
              Login
            </Link>
            <div className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold">
              Sign Up
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            <div className="font-semibold mb-1">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {debugInfo && (
          <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg mb-4 text-xs">
            <div className="font-semibold mb-2">Debug Info:</div>
            <div className="space-y-1">
              <div><strong>Step:</strong> {debugInfo.step}</div>
              <div><strong>Error:</strong></div>
              <pre className="bg-slate-900 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(debugInfo.error, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 font-medium hover:text-blue-300 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

