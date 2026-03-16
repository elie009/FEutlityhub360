import { Plus, Wifi, Eye, EyeOff, Copy, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export function CardsSection() {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const cardNumber = '1253 5432 3521 3090';
  const maskedNumber = '**** **** **** 3090';
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-gray-900">Your cards</h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-[#b3ee9a] rounded-full flex items-center justify-center hover:bg-[#a3de8a] hover:scale-110 transition-all shadow-lg shadow-[#b3ee9a]/20">
            <Plus size={18} className="text-gray-900" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
            <MoreVertical size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-[#8b7fd6] to-[#a594e8] rounded-2xl p-5 relative overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group aspect-[1.586/1]">
        <div className="absolute top-3 right-4 opacity-60 group-hover:opacity-100 transition">
          <Wifi size={20} className="text-white" />
        </div>
        
        <div className="mt-6 mb-8">
          <div className="text-white/80 text-xs mb-1.5">Card Number</div>
          <div className="flex items-center gap-3">
            <div className="text-white text-lg tracking-wider">
              {showCardNumber ? cardNumber : maskedNumber}
            </div>
            <button 
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="text-white/60 hover:text-white transition"
            >
              {showCardNumber ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button 
              className="text-white/60 hover:text-white transition"
              onClick={() => navigator.clipboard.writeText(cardNumber)}
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-white/80 text-xs mb-1">Card Holder</div>
            <div className="text-white text-sm">National WBank</div>
          </div>
          <div>
            <div className="text-white/80 text-xs mb-1 text-right">Exp</div>
            <div className="text-white text-sm">03/24</div>
          </div>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-8 h-8 bg-white/30 rounded-full"></div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
        <div className="absolute -right-4 -bottom-16 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform"></div>
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs">
        <div className="text-gray-500">Available balance</div>
        <div className="text-gray-900 text-lg">22,250.00</div>
      </div>
    </div>
  );
}