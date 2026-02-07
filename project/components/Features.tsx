import { PieChart, Shield, TrendingUp, Bell, Calculator, Users } from 'lucide-react';

const features = [
  {
    icon: PieChart,
    title: 'Budget Tracking',
    description: 'Monitor your spending habits and create custom budgets that align with your financial goals.'
  },
  {
    icon: TrendingUp,
    title: 'Investment Analytics',
    description: 'Get real-time insights into your investment portfolio with comprehensive analytics and reporting.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Bank-level encryption ensures your financial data stays protected and confidential.'
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Stay on top of bills, unusual spending, and important financial milestones with automated notifications.'
  },
  {
    icon: Calculator,
    title: 'Financial Planning',
    description: 'Use powerful calculators and planning tools to prepare for major life events and purchases.'
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    description: 'Collaborate with family members or advisors with secure role-based access controls.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4">Everything You Need to Manage Your Finances</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Powerful tools designed to give you complete control over your financial life
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
