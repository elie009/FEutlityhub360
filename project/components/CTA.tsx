import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white text-3xl lg:text-4xl mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of users who are already making smarter financial decisions with UtilityHub360
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition">
              Contact Sales
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
