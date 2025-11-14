import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">🎲 LUDOMANIA</h1>
          <p className="text-2xl mb-8">Play Ludo. Win Real Money.</p>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Challenge your friends to classic Ludo games with real money on the line.
            Winner takes all!
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-purple-600 transition"
            >
              Login
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Real Money</h3>
              <p className="text-sm">Deposit, play, and withdraw your winnings easily</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Real-time Play</h3>
              <p className="text-sm">Live multiplayer games with instant updates</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure</h3>
              <p className="text-sm">Your funds and data are safe with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
