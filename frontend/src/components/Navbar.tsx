import React, { useState } from 'react';
import { User, NotificationItem, DisplayNames } from '../types';
import { Heart, Sun, Moon, LogOut, UserCheck, Shield, Sparkles, Bell, Settings } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface NavbarProps {
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onQuickSwitchUser: (username: string) => void;
  notifications?: NotificationItem[];
  displayNames?: DisplayNames;
  onMarkNotificationRead?: (id: string) => Promise<void>;
  onMarkAllNotificationsRead?: () => Promise<void>;
  onSelectNotification?: (notif: NotificationItem) => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onQuickSwitchUser,
  notifications = [],
  displayNames,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectNotification,
  onOpenSettings
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const adminName = displayNames?.adminName || 'Aboli';
  const learnerName = displayNames?.learnerName || 'Boyfriend';
  const currentDisplayName = user?.role === 'admin' ? adminName : learnerName;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#2B2826]/95 border-b border-pink-100 dark:border-[#5D574D] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-[#3E3B39] dark:text-[#F5F2ED] tracking-tight font-serif">
                Study & Progress
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-900">
                ❤️ Soft Pink Theme
              </span>
            </div>
            <p className="text-xs text-pink-600 dark:text-pink-300 font-medium">
              {adminName} & {learnerName} • N4 & N5 • Surprises
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Notification Bell Icon */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-2xl text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-all focus:outline-none"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-pink-500" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#2B2826] animate-pulse">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkRead={async (id) => {
                    if (onMarkNotificationRead) await onMarkNotificationRead(id);
                  }}
                  onMarkAllRead={async () => {
                    if (onMarkAllNotificationsRead) await onMarkAllNotificationsRead();
                  }}
                  onSelectNotification={(notif) => {
                    setShowNotifications(false);
                    if (onSelectNotification) onSelectNotification(notif);
                  }}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-2xl text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-colors focus:outline-none"
            title={darkMode ? 'Switch to Light Soft Pink Theme' : 'Switch to Dark Soft Pink Theme'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-pink-500" />}
          </button>

          {/* Settings Modal Button */}
          {user && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl text-[#3E3B39] dark:text-[#F5F2ED] hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-colors focus:outline-none"
              title="Mutual Name Settings & Preferences"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5 text-pink-500" />
            </button>
          )}

          {user && (
            <>
              {/* Account Role Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pink-50/80 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900">
                {user.role === 'admin' ? (
                  <Shield className="w-4 h-4 text-pink-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-pink-500" />
                )}
                <div className="text-left">
                  <span className="block text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED]">
                    {currentDisplayName}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-pink-600 dark:text-pink-300">
                    {user.role === 'admin' ? '👩 Manager Mode' : '👨 Learner Mode'}
                  </span>
                </div>
              </div>

              {/* Quick Role Switcher Button */}
              <button
                id="quick-switch-role-btn"
                onClick={() => onQuickSwitchUser(user.role === 'admin' ? 'learner' : 'admin')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-sm shadow-pink-500/20 transition-all active:scale-95"
                title={`Switch to ${user.role === 'admin' ? learnerName : adminName} View`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">
                  Switch to {user.role === 'admin' ? learnerName : adminName}
                </span>
              </button>

              {/* Logout Button */}
              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-colors"
                title="Log Out"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
