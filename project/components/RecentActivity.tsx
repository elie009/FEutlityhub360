import { CheckCircle, TrendingUp, Target, DollarSign } from 'lucide-react';

const activities = [
  {
    icon: CheckCircle,
    title: 'Profile Status',
    subtitle: 'Profile completed with 2 income sources',
    badge: '2 income sources',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-700'
  },
  {
    icon: TrendingUp,
    title: 'Monthly Income',
    value: '85,000.00',
    subtitle: 'From 2 sources',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-900'
  },
  {
    icon: Target,
    title: 'Monthly Goals',
    value: '0.00',
    subtitle: 'Savings, Investment & Emergency',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    valueColor: 'text-orange-900'
  },
  {
    icon: DollarSign,
    title: 'Disposable Amount',
    value: '73,518.52',
    subtitle: 'Available this month',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    valueColor: 'text-green-900'
  }
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-gray-900 font-medium">Recent Activity</h2>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          Active Profile
        </div>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-xl border ${activity.bgColor} ${activity.borderColor} hover:shadow-md transition-all cursor-pointer group`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${activity.iconColor} group-hover:scale-110 transition-transform`}>
                <activity.icon size={18} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                  {activity.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activity.badgeColor}`}>
                      {activity.badge}
                    </span>
                  )}
                </div>
                
                {activity.value && (
                  <div className={`text-xl font-semibold mb-1 ${activity.valueColor}`}>
                    {activity.value}
                  </div>
                )}
                
                {activity.subtitle && (
                  <p className="text-xs text-gray-600">{activity.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
