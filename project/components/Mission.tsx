import { Target } from 'lucide-react';

export function Mission() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="text-blue-600" size={32} />
            </div>
          </div>
          <h2 className="text-center text-3xl lg:text-4xl mb-6">Our Mission</h2>
          <p className="text-center text-gray-600 text-lg lg:text-xl leading-relaxed">
            At UtilityHub360, we believe that everyone deserves access to powerful financial management tools. Our mission is to simplify complex financial processes and make them accessible to all, helping you make informed decisions about your money.
          </p>
        </div>
      </div>
    </section>
  );
}
