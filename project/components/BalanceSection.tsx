import { Plus, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { IncomeChart } from './IncomeChart';

export function BalanceSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-1 text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage your payments and transactions in one click</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm border border-gray-200 hover:border-gray-300 text-gray-900">
            <Plus size={16} />
            Add widget
          </button>
          <button className="px-4 py-2 bg-[#b3ee9a] text-gray-900 rounded-lg flex items-center gap-2 hover:bg-[#a3de8a] transition-all text-sm shadow-lg shadow-[#b3ee9a]/20">
            <Calendar size={16} />
            May 01 - May 15
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-500 text-sm">Total balance</div>
            <div className="flex items-center gap-1 text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">
              <TrendingUp size={12} />
              <span>+5%</span>
            </div>
          </div>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl text-gray-900">80,300</span>
          </div>
          
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm group text-gray-900">
              <span className="flex items-center justify-center gap-2">
                Deposit
                <ArrowDownRight size={14} className="group-hover:translate-y-0.5 transition-transform" />
              </span>
            </button>
            <button className="flex-1 py-2.5 bg-[#b3ee9a] text-gray-900 rounded-lg hover:bg-[#a3de8a] transition-all text-sm shadow-lg shadow-[#b3ee9a]/20 group">
              <span className="flex items-center justify-center gap-2">
                Transfer
                <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div>
              <div className="text-gray-500 text-xs mb-1">Main balance</div>
              <div className="text-xl text-gray-900">73,300</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Credit balance</div>
              <div className="text-xl text-gray-900">5,000</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="h-1.5 bg-gray-200 rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#b3ee9a] to-[#8bc876] rounded-full transition-all duration-500" style={{ width: '42%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>2,000 credit spent</span>
              <span>42%</span>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="col-span-2">
          <IncomeChart />
        </div>
      </div>
    </div>
  );
}