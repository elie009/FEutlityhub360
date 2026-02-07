import { Search, Bell, Wallet, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <header className="h-20 bg-white px-6 flex items-center justify-between border-b border-gray-200 shadow-sm ml-6 mr-6 mt-6 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#b3ee9a] rounded-full flex items-center justify-center shadow-lg shadow-[#b3ee9a]/30">
          <span className="text-xl">💰</span>
        </div>
        <div>
          <span className="text-xl text-gray-900">Wealth Wave</span>
          <p className="text-xs text-gray-500">Financial Dashboard</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all group">
          <Search size={20} className="text-gray-500 group-hover:text-gray-900 transition" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all relative group"
          >
            <Bell size={20} className="text-gray-500 group-hover:text-gray-900 transition" />
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50 text-white">
              3
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                <button className="text-xs text-[#5ba842] hover:underline">Mark all read</button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <p className="text-sm text-gray-900">Payment received: $360.80</p>
                  <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <p className="text-sm text-gray-900">Goal milestone: Trip to Spain 90% complete!</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <p className="text-sm text-gray-900">Transaction limit warning</p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button className="px-4 h-10 rounded-full bg-white flex items-center gap-2 hover:bg-gray-100 transition-all border border-gray-200">
          <Wallet size={18} className="text-gray-500" />
          <span className="text-sm text-gray-900">Wallet</span>
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-lg">
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}