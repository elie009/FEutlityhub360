import { AlertCircle, TrendingUp } from 'lucide-react';

export function TransactionLimit() {
  const spent = 10000;
  const limit = 12000;
  const percentage = (spent / limit) * 100;
  const remaining = limit - spent;
  const isNearLimit = percentage >= 80;
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-gray-900">Daily transactions limit</h2>
        {isNearLimit && (
          <div className="text-orange-500">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isNearLimit ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-[#b3ee9a] to-[#8bc876]'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-500">{spent.toLocaleString()} spent of {limit.toLocaleString()}</span>
        <span className={`font-medium ${isNearLimit ? 'text-orange-500' : 'text-gray-900'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Remaining today</span>
          <span className="text-green-600 font-medium">{remaining.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Avg. daily spend</span>
          <span className="text-gray-900 flex items-center gap-1">
            8,500
            <TrendingUp size={10} className="text-green-600" />
          </span>
        </div>
      </div>
      
      {isNearLimit && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-orange-600">
            You're approaching your daily limit. Consider adjusting your spending or increasing your limit.
          </p>
        </div>
      )}
    </div>
  );
}