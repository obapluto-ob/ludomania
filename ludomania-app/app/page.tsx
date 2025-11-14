import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-white text-2xl sm:text-3xl font-bold tracking-tight">LUDOMANIA</div>
        <div className="flex gap-3 sm:gap-4">
          <Link
            href="/auth/login"
            className="text-white hover:text-blue-300 transition px-4 py-2 text-sm sm:text-base"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center text-white max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            LUDOMANIA
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 font-semibold text-blue-200">
            Play Ludo. Win Real Money.
          </p>
          <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 text-gray-300 max-w-3xl mx-auto px-4">
            Challenge your friends to classic Ludo games with real money stakes.
            Available in Kenya and worldwide. Secure, fast, and exciting. Winner takes all!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 lg:mb-20 px-4">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/50"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="bg-slate-800 border-2 border-blue-500 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-700 transition"
            >
              Login
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mt-12 sm:mt-16 lg:mt-20 px-4">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-slate-700 hover:border-blue-500 transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-blue-300">Real Money Games</h3>
              <p className="text-sm sm:text-base text-gray-400">Deposit via M-Pesa, bank transfer, or card. Withdraw your winnings instantly to your preferred method.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-slate-700 hover:border-blue-500 transition">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-blue-300">Real-time Multiplayer</h3>
              <p className="text-sm sm:text-base text-gray-400">Live games with instant updates. Play with friends in Kenya or anywhere in the world, anytime.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-slate-700 hover:border-blue-500 transition sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-blue-300">Bank-Level Security</h3>
              <p className="text-sm sm:text-base text-gray-400">Your funds and data are protected with enterprise-grade encryption. Play with confidence.</p>
            </div>
          </div>

          {/* Kenya-Specific Section */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl p-6 sm:p-10 border border-emerald-700/50 mt-12 sm:mt-16 lg:mt-20 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-emerald-300">Available in Kenya & Worldwide</h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">M-Pesa Integration</h4>
                  <p className="text-sm text-gray-400">Deposit and withdraw using M-Pesa for instant transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Play from Anywhere</h4>
                  <p className="text-sm text-gray-400">Whether you're in Nairobi, abroad, or anywhere else in the world</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Mobile Optimized</h4>
                  <p className="text-sm text-gray-400">Works perfectly on any device - phone, tablet, or computer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Local Support</h4>
                  <p className="text-sm text-gray-400">24/7 customer support in English and Swahili</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mt-12 sm:mt-16 lg:mt-20 pt-12 sm:pt-20 border-t border-slate-700 px-4">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-sm sm:text-base text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2">KSh 5M+</div>
              <div className="text-sm sm:text-base text-gray-400">Winnings Paid</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-sm sm:text-base text-gray-400">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-12 sm:mt-20 border-t border-slate-800 text-center text-gray-500">
        <p className="text-sm sm:text-base">&copy; 2025 Ludomania. All rights reserved. Play responsibly.</p>
      </footer>
    </div>
  );
}
