import React from 'react';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, MessageSquare, Heart, Mic, Sparkles, CheckSquare, Gift, X } from 'lucide-react';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onSelectNotification: (notif: NotificationItem) => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectNotification,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'cute_note':
      case 'encouragement':
        return <MessageSquare className="w-4 h-4 text-pink-500" />;
      case 'reaction':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'voice_note':
        return <Mic className="w-4 h-4 text-purple-500" />;
      case 'surprise':
        return <Gift className="w-4 h-4 text-amber-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#322E2B] rounded-3xl border border-pink-100 dark:border-[#5D574D] shadow-2xl z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-transparent border-b border-pink-100 dark:border-[#5D574D] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-serif text-[#3E3B39] dark:text-[#F5F2ED]">
              Notifications
            </h3>
            <p className="text-[10px] text-pink-600 dark:text-pink-300 font-semibold">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 hover:underline px-2 py-1 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/50 flex items-center space-x-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-pink-50 dark:divide-[#4A4744]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-pink-400" />
            <p>No notifications yet!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                onSelectNotification(n);
              }}
              className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all hover:bg-pink-50/60 dark:hover:bg-[#4A4744]/60 ${
                !n.read ? 'bg-pink-50/40 dark:bg-pink-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-pink-100/80 dark:bg-pink-900/40 mt-0.5 flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#3E3B39] dark:text-[#F5F2ED] truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0">
                    {formatTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0 animate-pulse"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
