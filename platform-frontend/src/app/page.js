export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#09090b]">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Navbar */}
      <nav className="glass fixed w-full z-50 top-0 transition-all duration-300 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tighter">
          Serve<span className="text-blue-500">QR</span>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="text-gray-300 hover:text-white px-4 py-2 transition-colors">Login</a>
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-40 relative z-10">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass text-sm text-blue-400 font-medium">
          ✨ The Future of Restaurant Ordering
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 max-w-5xl">
          One Platform. <br />
          <span className="text-gradient">Zero Friction.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Transform your restaurant with smart QR menus, instant order routing, and seamless payments. Built for modern dining.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a href="/register" className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl shadow-white/10 flex items-center justify-center gap-2">
            Start Free Trial
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a href="#features" className="glass px-8 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            See Features
          </a>
        </div>
      </main>

      {/* Features Preview */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Dynamic QR Menus", desc: "Update prices and items in real-time. No more re-printing physical menus or waiting." },
            { title: "Smart Payments", desc: "Support for UPI, Cards, or simple OTP verification based entirely on your restaurant's needs." },
            { title: "Kitchen Display", desc: "Orders flow directly to the kitchen display system instantly without manual entry." }
          ].map((feature, i) => (
            <div key={i} className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
