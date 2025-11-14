'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUserId(user.id);

    // Get username
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUsername(profile.username);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setProofFile(file);
    setUploadingProof(true);
    setError('');

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `deposit-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('transaction-proofs')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('transaction-proofs')
        .getPublicUrl(filePath);

      setProofUrl(urlData.publicUrl);
    } catch (err: any) {
      setError('Failed to upload screenshot. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'pending',
          payment_method: 'mpesa',
          mpesa_number: mpesaNumber,
          mpesa_name: mpesaName,
          proof_url: proofUrl,
        });

      if (txError) {
        throw new Error('Failed to create transaction');
      }

      // Send admin notification
      await fetch('/api/deposit-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          userId,
          amount: parseFloat(amount),
          mpesaNumber,
          mpesaName,
          proofUrl,
        }),
      });

      setSuccess(true);
      setAmount('');
      setMpesaNumber('');
      setMpesaName('');
      setProofUrl('');
      setProofFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Title with M-Pesa Logo */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
            {/* M-Pesa Logo */}
            <div className="bg-green-600 px-4 py-2 rounded-lg">
              <span className="text-white font-bold text-xl">M-PESA</span>
            </div>
          </div>

          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Deposit request submitted! Admin will approve within 24 hours.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* M-Pesa Instructions */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-600 p-3 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-400 mb-3 text-lg">How to Deposit via M-Pesa:</h3>
                <ol className="text-gray-300 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <span>Go to M-Pesa menu on your phone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <span>Select "Send Money"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <span>Enter number: <strong className="text-green-400">0793899197</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                    <span>Enter amount and confirm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
                    <span>Take screenshot of confirmation SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">6</span>
                    <span>Fill the form below with your details</span>
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Send M-Pesa to:</p>
                  <p className="text-green-400 font-bold">0793899197 - Specioza Attila</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Amount (KSh)
              </label>
              <input
                type="number"
                step="1"
                min="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                placeholder="e.g. 500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Minimum deposit: KSh 50</p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Your M-Pesa Number
              </label>
              <input
                type="tel"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                placeholder="e.g. 0712345678"
                required
                pattern="[0-9]{10}"
              />
              <p className="text-xs text-gray-400 mt-1">The number you sent money from</p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Your Name (as on M-Pesa)
              </label>
              <input
                type="text"
                value={mpesaName}
                onChange={(e) => setMpesaName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                M-Pesa Confirmation Proof
              </label>

              {/* File Upload Option */}
              <div className="mb-4">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-green-500 transition bg-slate-700/50">
                    {proofFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-green-400 font-semibold">{proofFile.name}</p>
                          <p className="text-gray-400 text-sm">Screenshot uploaded successfully</p>
                        </div>
                      </div>
                    ) : uploadingProof ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-green-400">Uploading screenshot...</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-white font-semibold mb-1">Upload M-Pesa Screenshot</p>
                        <p className="text-gray-400 text-sm">Click to select image from your device</p>
                        <p className="text-gray-500 text-xs mt-2">JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t border-slate-600"></div>
                <span className="text-gray-400 text-sm">OR</span>
                <div className="flex-1 border-t border-slate-600"></div>
              </div>

              {/* Text Input Option */}
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Enter M-Pesa confirmation code (e.g. QA12BC3DEF)"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              />
              <p className="text-sm text-gray-400 mt-1">
                Upload screenshot above OR enter the M-Pesa confirmation code from your SMS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 shadow-lg shadow-green-500/30"
            >
              {loading ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              <strong className="text-blue-400">🔒 Secure Transaction:</strong> Your deposit will be verified and credited within 24 hours. Keep your M-Pesa confirmation SMS safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

