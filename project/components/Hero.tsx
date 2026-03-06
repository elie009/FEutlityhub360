import { ArrowRight, Menu } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">UH</span>
          </div>
          <span className="text-white text-xl">UtilityHub360</span>
        </div>
        <button className="lg:hidden text-white">
          <Menu size={24} />
        </button>
        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-white hover:text-blue-200 transition">Features</a>
          <a href="#how-it-works" className="text-white hover:text-blue-200 transition">How It Works</a>
          <a href="#about" className="text-white hover:text-blue-200 transition">About</a>
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-white text-4xl lg:text-6xl mb-6">
            Powerful Financial Management for Everyone
          </h1>
          <p className="text-blue-100 text-lg lg:text-xl mb-8 max-w-2xl mx-auto">
            Simplify complex financial processes and make informed decisions about your money with our comprehensive suite of tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </div>
  );
}
