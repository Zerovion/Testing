import React from 'react';
import { CheckSquare, Calendar, Gift, MessageSquare, BarChart3, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onOpenSettings
}) => {
  const navItems = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'routine', label: 'Routine', icon: Calendar },
    { id: 'surprises', label: 'Surprises', icon: Gift },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 },
    { id: 'progress', label: 'Progress', icon: BarChart3 }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#2B2826]/95 backdrop-blur-md border-t border-pink-100 dark:border-[#5D574D] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-pink-600 dark:text-pink-300 bg-pink-100/60 dark:bg-pink-950/60 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-pink-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse border-2 border-white dark:border-[#2B2826]"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center py-1 px-2.5 text-slate-500 dark:text-slate-400 hover:text-pink-500 rounded-2xl transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>
      </div>
    </div>
  );
};
