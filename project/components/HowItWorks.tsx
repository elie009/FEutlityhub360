import { UserPlus, Link2, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in minutes and set up your secure profile with just a few clicks.'
  },
  {
    icon: Link2,
    title: 'Connect Your Accounts',
    description: 'Securely link your bank accounts, credit cards, and investment accounts in one place.'
  },
  {
    icon: BarChart3,
    title: 'Start Managing',
    description: 'Access real-time insights, create budgets, and take control of your financial future.'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get started with UtilityHub360 in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-blue-200" />
              )}
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-6 mx-auto relative z-10">
                  <step.icon className="text-white" size={48} />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white z-20">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
