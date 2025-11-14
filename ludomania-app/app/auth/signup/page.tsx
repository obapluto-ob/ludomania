'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Check if username already exists
      const { data: existingUsername, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no match

      // Only block if username actually exists (ignore query errors)
      if (existingUsername && !usernameCheckError) {
        setError('Username already taken. Please choose another one.');
        setLoading(false);
        return;
      }

      // Sign up user with username in metadata and display name
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username,  // Set display name to username
            display_name: username,  // Also set display_name
          },
        },
      });

      if (authError) {
        // Log detailed error to console for debugging
        console.error('🔴 Supabase Auth Error:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          email,
          username,
        });

        // User-friendly error messages
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          setError('This email is already registered. Please login instead.');
        } else if (authError.message.includes('Invalid email')) {
          setError('Invalid email format. Please check and try again.');
        } else if (authError.message.includes('Password')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(`Registration failed: ${authError.message}`);
        }

        // Send debug info to backend (only if backend is running)
        if (process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL && !process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL.includes('localhost')) {
          await fetch(process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL + '/debug-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step: 'Auth Signup',
              error: authError,
              email,
              username,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {}); // Ignore if backend is down
        }

        setLoading(false);
        return;
      }

      if (authData.user) {
        // Wait a moment for auth to fully process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if profile already exists (created by trigger)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          // Profile doesn't exist, create it manually
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            username,
            wallet_balance: 0,
          });

          if (profileError) {
            // Log detailed error info
            console.error('Profile creation error:', {
              error: profileError,
              userId: authData.user.id,
              username,
              email,
              errorCode: profileError.code,
              errorMessage: profileError.message,
            });

            setError('Account created but profile setup failed. Please contact support.');
            setLoading(false);
            return;
          }
        } else if (existingProfile.username !== username) {
          // Profile exists but username is wrong, update it
          await supabase
            .from('profiles')
            .update({ username })
            .eq('id', authData.user.id);
        }

        // Send admin notification with all user data
        const adminNotification = await fetch('/api/user-registered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            userId: authData.user.id,
            registeredAt: new Date().toISOString(),
            ipAddress: 'N/A', // Will be captured by backend
          }),
        });

        if (!adminNotification.ok) {
          // Log to backend but don't show error to user
          await fetch(process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL + '/debug-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step: 'Admin Email Notification',
              error: await adminNotification.text(),
              userId: authData.user.id,
              email,
              username,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {});
        }

        // Success - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('System error occurred. Please try again later.');

      // Send debug info to backend
      await fetch(process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL + '/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'Unknown Error',
          error: err.message || err,
          email,
          username,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
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
            <div className="font-semibold mb-1">Registration Failed</div>
            <div className="text-sm">{error}</div>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white pr-12"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white pr-12"
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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

