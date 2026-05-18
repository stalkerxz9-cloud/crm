import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  Phone,
  PhoneIncoming,
  Bot,
  X,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatRelativeTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Дашборд',
  '/contacts': 'Контакты',
  '/calls': 'Звонки',
  '/activities': 'Активности',
  '/analytics': 'Аналитика',
  '/settings': 'Настройки',
};

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const {
    sidebarCollapsed,
    unreadCount,
    notifications,
    markNotificationRead,
    clearNotifications,
    activeCallId,
    setSearchQuery,
  } = useStore();

  const title = pageTitles[location.pathname] || 'CRM Pro';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSearchQuery(e.target.value);
  };

  const getNotifIcon = (type: string) => {
    if (type === 'incoming_call') return <PhoneIncoming className="h-4 w-4 text-emerald-500" />;
    if (type === 'call_ended') return <Phone className="h-4 w-4 text-blue-500" />;
    if (type === 'analysis_complete') return <Bot className="h-4 w-4 text-violet-500" />;
    return <Bell className="h-4 w-4 text-slate-500" />;
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      {/* Left: Page title + Active call indicator */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {activeCallId && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">Звонок активен</span>
          </div>
        )}
      </div>

      {/* Right: Search + Notifications */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchValue}
            onChange={handleSearch}
            placeholder="Поиск..."
            className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-violet-300 transition-all w-48 focus:w-64"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-semibold text-slate-900 text-sm">Уведомления</span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={() => { clearNotifications(); setShowNotifications(false); }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Очистить
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Нет новых уведомлений</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.type === 'incoming_call' || n.type === 'call_ended' || n.type === 'analysis_complete') {
                          navigate('/calls');
                          setShowNotifications(false);
                        }
                      }}
                      className={cn(
                        'flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors',
                        !n.read && 'bg-violet-50/50'
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.timestamp)}</p>
                      </div>
                      {!n.read && (
                        <div className="flex-shrink-0 h-2 w-2 bg-violet-500 rounded-full mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
