import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, PiggyBank } from 'lucide-react';

const stats = [
  {
    icon: DollarSign,
    label: 'Total Income',
    value: '84,240',
    change: '+12.5%',
    trend: 'up',
    color: '#b3ee9a'
  },
  {
    icon: CreditCard,
    label: 'Total Expenses',
    value: '42,180',
    change: '-8.3%',
    trend: 'down',
    color: '#8b7fd6'
  },
  {
    icon: Wallet,
    label: 'Net Savings',
    value: '42,060',
    change: '+18.9%',
    trend: 'up',
    color: '#10b981'
  },
  {
    icon: PiggyBank,
    label: 'Goals Progress',
    value: '67%',
    change: '+5.2%',
    trend: 'up',
    color: '#ef4444'
  }
];

export function QuickStats() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              stat.trend === 'up' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{stat.change}</span>
            </div>
          </div>
          <div className="text-2xl mb-1 text-gray-900 group-hover:text-gray-700 transition-colors">{stat.value}</div>
          <div className="text-xs text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}