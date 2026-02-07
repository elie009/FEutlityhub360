import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useState } from 'react';

const cashFlowData = [
  { month: 'Jan', expense: 30000, net: 15000, income: 45000 },
  { month: 'Feb', expense: 35000, net: 17000, income: 52000 },
  { month: 'Mar', expense: 32000, net: 16000, income: 48000 },
  { month: 'Apr', expense: 40000, net: 21000, income: 61000 },
  { month: 'May', expense: 45000, net: 35000, income: 80000 },
  { month: 'Jun', expense: 38000, net: 17000, income: 55000 },
  { month: 'Jul', expense: 42000, net: 16000, income: 58000 },
  { month: 'Aug', expense: 44000, net: 19000, income: 63000 },
  { month: 'Sep', expense: 36000, net: 15000, income: 51000 },
  { month: 'Oct', expense: 34000, net: 15000, income: 49000 },
  { month: 'Nov', expense: 46000, net: 21000, income: 67000 },
  { month: 'Dec', expense: 41000, net: 18000, income: 59000 },
];

const expenseAnalysisData = [
  { category: 'Rent', amount: 30000 },
  { category: 'Hotel', amount: 25800 },
  { category: 'Withdrawal', amount: 22400 },
  { category: 'Insurance', amount: 12400 },
  { category: 'Utilities', amount: 9520 },
  { category: 'Suppliers', amount: 7400 },
  { category: 'SAVINGS TRANSACTION', amount: 3600 },
  { category: 'Groceries', amount: 1900 },
  { category: 'FOOD', amount: 680 },
  { category: 'Uncategorized', amount: 780 },
];

const CashFlowTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.expense + data.net;
    const isBalanced = total === data.income;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-gray-500 mb-2">{data.month}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1e3a8a' }}></span>
            <span>Expense: {data.expense.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
            <span>Net: {data.net.toLocaleString()}</span>
          </p>
          <div className="border-t border-gray-200 pt-1 mt-1">
            <p className="text-sm text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93c5fd' }}></span>
              <span>Income: {data.income.toLocaleString()}</span>
            </p>
            <p className="text-xs mt-1 flex items-center gap-1">
              <span className="text-gray-500">Total (Exp+Net):</span>
              <span className={isBalanced ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                {total.toLocaleString()}
              </span>
            </p>
            {isBalanced ? (
              <p className="text-xs text-green-600 mt-1">✓ Balanced</p>
            ) : (
              <p className="text-xs text-orange-600 mt-1">
                {total > data.income ? '⚠ Overspent' : '⚠ Underspent'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ExpenseTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-gray-900 mb-1">{data.category}</p>
        <p className="text-sm text-red-600 font-medium">
          {data.amount.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function IncomeChart() {
  const [activeTab, setActiveTab] = useState<'cashflow' | 'expense'>('cashflow');
  const [year, setYear] = useState('2025');

  return (
    <div className="bg-white rounded-2xl p-6 h-full border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <select 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-gray-50 px-4 py-1.5 rounded-lg text-sm border border-gray-200 outline-none cursor-pointer hover:border-gray-300 transition text-gray-900"
          >
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
              activeTab === 'cashflow'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly Cash Flow
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
              activeTab === 'expense'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expense Analysis (Top 10 - Year)
          </button>
        </div>
      </div>

      {activeTab === 'cashflow' ? (
        <>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1e3a8a' }}></div>
              <span className="text-xs text-gray-600">Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs text-gray-600">Net</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93c5fd' }}></div>
              <span className="text-xs text-gray-600">Income</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cashFlowData} barGap={8} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip content={<CashFlowTooltip />} cursor={{ fill: 'rgba(179, 238, 154, 0.1)' }} />
              
              {/* Stacked bars for Expense + Net */}
              <Bar 
                dataKey="expense" 
                stackId="a"
                fill="#1e3a8a"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="net" 
                stackId="a"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              
              {/* Income as reference bar */}
              <Bar 
                dataKey="income" 
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                fillOpacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          {/* Legend for Expense Analysis */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Expense Amount</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={expenseAnalysisData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(2)}`}
              />
              <Tooltip content={<ExpenseTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
