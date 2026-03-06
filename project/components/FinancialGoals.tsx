import { ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const goals = [
  {
    name: 'Buy iphone 15',
    deadline: 'May 8, 2024',
    savedUp: 360,
    goal: 1200,
    percentage: 30,
    color: '#b3ee9a',
    trend: '+45 this week'
  },
  {
    name: 'Trip to Spain',
    deadline: 'August 15, 2024',
    savedUp: 3260,
    goal: 6600,
    percentage: 90,
    color: '#8b5cf6',
    trend: '+120 this week'
  },
  {
    name: 'For a new house',
    deadline: 'May 12, 2025',
    savedUp: 120300,
    goal: 180000,
    percentage: 77,
    color: '#ef4444',
    trend: '+2,400 this week'
  }
];

export function FinancialGoals() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-gray-900">Financial goals</h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-[#b3ee9a] hover:bg-[#a3de8a] rounded-full flex items-center justify-center transition-all shadow-lg shadow-[#b3ee9a]/20">
            <Plus size={16} className="text-gray-900" />
          </button>
          <button className="text-gray-500 hover:text-gray-900 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div 
            key={index} 
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={goal.color}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - goal.percentage / 100)}`}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.6s ease',
                    filter: hoveredIndex === index ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-900">
                {goal.percentage}%
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm mb-1 text-gray-900 group-hover:text-gray-700 transition-colors">{goal.name}</h3>
              <p className="text-xs text-gray-500 mb-1">Deadline: {goal.deadline}</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp size={10} />
                <span>{goal.trend}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Saved up</div>
              <div className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">{goal.savedUp.toLocaleString()}</div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Goal</div>
              <div className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">{goal.goal.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}