import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  Receipt,
  BarChart3,
} from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/medicines', icon: Pill, label: 'Medicines' },
    { path: '/expiry', icon: Calendar, label: 'Expiry' },
    { path: '/billing', icon: Receipt, label: 'Billing' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 safe-area-bottom backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
      <div className="flex justify-around items-center py-2 px-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 flex-1 max-w-16 mx-1 group ${
                active
                  ? 'text-[#F09F0D] dark:text-[#F09F0D] bg-orange-50 dark:bg-orange-900/20 transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105'
              }`}
            >
              <div className={`relative p-1.5 rounded-lg transition-all duration-300 ${
                active 
                  ? 'bg-orange-100 dark:bg-orange-900/30 shadow-md' 
                  : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50'
              }`}>
                <Icon 
                  size={20} 
                  className={`transition-all duration-300 ${
                    active 
                      ? 'text-[#F09F0D] scale-110' 
                      : 'group-hover:scale-110'
                  }`} 
                />
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#F09F0D] rounded-full animate-ping"></div>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium text-center leading-tight transition-all duration-300 ${
                active 
                  ? 'text-[#F09F0D] font-semibold scale-105' 
                  : 'group-hover:scale-105'
              }`}>
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {active && (
                <div className="absolute -top-1 w-1 h-1 bg-[#F09F0D] rounded-full animate-bounce"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooter;