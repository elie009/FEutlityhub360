import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate calendar days for January 2026
const generateCalendarDays = () => {
  const days = [];
  const firstDay = 4; // January 1, 2026 is a Thursday (4)
  const totalDays = 31;
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }
  
  return days;
};

const loanDates = {
  10: { status: 'paid', amount: '11,250' },
  31: { status: 'pending', amount: '11,250' }
};

export function LoanSchedules() {
  const [currentMonth, setCurrentMonth] = useState('January 2026');
  const calendarDays = generateCalendarDays();
  
  const getDateStatus = (day: number | null) => {
    if (!day) return null;
    return loanDates[day as keyof typeof loanDates];
  };
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-gray-900 font-medium">Loan Schedules</h2>
        <button className="px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-sm border border-gray-200 text-gray-900 flex items-center gap-2">
          <Calendar size={16} />
          View All Loans
        </button>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-900">{currentMonth}</span>
        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const status = getDateStatus(day);
            const isToday = day === 10;
            
            return (
              <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-pointer relative ${
                  !day
                    ? 'invisible'
                    : status
                    ? status.status === 'paid'
                      ? 'bg-green-50 border-2 border-green-400 hover:border-green-500'
                      : 'bg-blue-50 border-2 border-blue-400 hover:border-blue-500'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-medium ${
                      status
                        ? status.status === 'paid'
                          ? 'text-green-900'
                          : 'text-blue-900'
                        : 'text-gray-900'
                    }`}>
                      {day}
                    </span>
                    {status && (
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        status.status === 'paid' ? 'bg-green-600' : 'bg-blue-600'
                      }`}></div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span className="text-xs text-gray-600">Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Overdue</span>
        </div>
      </div>
    </div>
  );
}
