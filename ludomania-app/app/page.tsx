import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">🎲 LUDOMANIA</div>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="text-white hover:text-blue-300 transition px-4 py-2"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            LUDOMANIA
          </h1>
          <p className="text-3xl mb-4 font-semibold text-blue-200">Play Ludo. Win Real Money.</p>
          <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
            Challenge your friends to classic Ludo games with real money stakes.
            Secure, fast, and exciting. Winner takes all!
          </p>

          <div className="flex gap-6 justify-center mb-20">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/50"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="bg-slate-800 border-2 border-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition"
            >
              Login
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Real Money Games</h3>
              <p className="text-gray-400">Deposit, play, and withdraw your winnings instantly. Secure payment processing.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Real-time Multiplayer</h3>
              <p className="text-gray-400">Live games with instant updates. Play with friends anywhere, anytime.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Bank-Level Security</h3>
              <p className="text-gray-400">Your funds and data are protected with enterprise-grade encryption.</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20 pt-20 border-t border-slate-700">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">₹50L+</div>
              <div className="text-gray-400">Winnings Paid</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-slate-800 text-center text-gray-500">
        <p>&copy; 2024 Ludomania. All rights reserved. Play responsibly.</p>
      </footer>
    </div>
  );
}
