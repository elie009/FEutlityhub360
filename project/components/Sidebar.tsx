import { LayoutGrid, Briefcase, CreditCard, Building2, PiggyBank, FileText, Bell, Settings, HelpCircle, Puzzle, LogOut, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', active: true, hasDropdown: false },
  { icon: Briefcase, label: 'Money Overview', active: false, hasDropdown: true },
  { icon: CreditCard, label: 'My Bills', active: false, hasDropdown: true },
  { icon: Building2, label: 'My Loans', active: false, hasDropdown: false },
  { icon: PiggyBank, label: 'My Savings', active: false, hasDropdown: true },
  { icon: FileText, label: 'Reports', active: false, hasDropdown: false },
  { icon: Bell, label: 'Notifications', active: false, hasDropdown: false, badge: '99+' },
  { icon: Settings, label: 'Settings', active: false, hasDropdown: false },
  { icon: HelpCircle, label: 'Help & Support', active: false, hasDropdown: false },
  { icon: Puzzle, label: 'Advanced', active: false, hasDropdown: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const toggleDropdown = (label: string) => {
    if (openDropdowns.includes(label)) {
      setOpenDropdowns(openDropdowns.filter(item => item !== label));
    } else {
      setOpenDropdowns([...openDropdowns, label]);
    }
  };

  return (
    <div 
      className={`bg-white flex flex-col py-6 transition-all duration-300 relative border-r border-gray-200 shadow-lg ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-[#b3ee9a] rounded-full flex items-center justify-center hover:bg-[#a3de8a] hover:scale-110 transition-all z-10 shadow-lg shadow-[#b3ee9a]/30"
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-gray-900" />
        ) : (
          <ChevronLeft size={14} className="text-gray-900" />
        )}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 mb-8 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-12 h-12 bg-[#b3ee9a] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#b3ee9a]/30">
          <span className="text-2xl">💰</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-xl whitespace-nowrap block text-gray-900">UtilityHub360</span>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
        {navItems.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => item.hasDropdown && !collapsed && toggleDropdown(item.label)}
              className={`w-full h-12 rounded-xl flex items-center gap-3 transition-all group relative ${
                collapsed ? 'justify-center' : 'px-4'
              } ${
                item.active 
                  ? 'bg-[#b3ee9a] text-gray-900 shadow-md border border-[#b3ee9a]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon 
                size={20} 
                className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                  item.active ? 'text-gray-900' : ''
                }`} 
              />
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.hasDropdown && (
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${
                        openDropdowns.includes(item.label) ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
            
            {/* Dropdown content - only shown when not collapsed */}
            {!collapsed && item.hasDropdown && openDropdowns.includes(item.label) && (
              <div className="ml-10 mt-1 space-y-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                  View All
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                  Recent
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Logout */}
      <div className="px-4 mt-4">
        <button 
          className={`w-full h-12 rounded-xl flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all group ${
            collapsed ? 'justify-center' : 'px-4'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">JD</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-sm whitespace-nowrap block text-gray-900">John Doe</span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
