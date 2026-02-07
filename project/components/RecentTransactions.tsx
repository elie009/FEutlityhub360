import { Coffee, Package, Home, ShoppingBag, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

const transactions = [
  {
    icon: Coffee,
    name: 'Coffee shop',
    date: '12 May, 9:40pm',
    amount: -25.90,
    bgColor: '#3a3d4a',
    category: 'Food & Drink'
  },
  {
    icon: Package,
    name: 'Refund for the order',
    date: '11 May, 2:10pm',
    amount: 360.80,
    bgColor: '#3a3d4a',
    category: 'Income'
  },
  {
    icon: Home,
    name: 'Rent payment',
    date: '11 May, 06:00am',
    amount: -1200.00,
    bgColor: '#3a3d4a',
    category: 'Housing'
  },
  {
    icon: ShoppingBag,
    name: 'Grocery store',
    date: '11 May, 1:55pm',
    amount: -743.00,
    bgColor: '#3a3d4a',
    category: 'Shopping'
  }
];

export function RecentTransactions() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-gray-900">Recent transaction</h2>
        <button className="text-gray-500 hover:text-gray-900 transition">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-gray-100"
            >
              <transaction.icon size={18} className="text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate text-gray-900 group-hover:text-gray-700 transition-colors">{transaction.name}</div>
              <div className="text-xs text-gray-500">{transaction.date}</div>
            </div>
            
            <div className="text-right">
              <div className={`text-sm font-medium flex items-center gap-1 ${
                transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
              }`}>
                {transaction.amount > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} className="text-gray-500" />}
                {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">{transaction.category}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-sm border border-gray-200 text-gray-900">
        View all transactions
      </button>
    </div>
  );
}