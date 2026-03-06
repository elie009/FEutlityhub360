import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { useState } from 'react';

const data = [
  { name: 'Online payments', value: 5200, color: '#b3ee9a' },
  { name: 'Card payments', value: 3800, color: '#8b7fd6' },
  { name: 'Transfer', value: 1200, color: '#ef4444' }
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function SpendingsChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-gray-900">Your spendings</h2>
        <select className="bg-gray-50 px-4 py-1.5 rounded-lg text-sm border border-gray-200 outline-none cursor-pointer hover:border-gray-300 transition text-gray-900">
          <option>Month</option>
          <option>Week</option>
          <option>Year</option>
        </select>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ 
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl text-gray-900">{total.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-6 mt-6">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="w-3 h-3 rounded-full transition-transform" style={{ 
              backgroundColor: item.color,
              transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)'
            }}></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{item.name}</span>
              <span className="text-sm text-gray-900">{item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}