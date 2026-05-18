import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Phone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Activity,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';
import { getInitials, getRoleLabel } from '../../utils/formatters';

const navItems = [
  { to: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/contacts', label: 'Контакты', icon: Users },
  { to: '/calls', label: 'Звонки', icon: Phone },
  { to: '/activities', label: 'Активности', icon: Activity },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/settings', label: 'Настройки', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentUser, logout, unreadCount, simulateIncomingCall } = useStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-900 flex flex-col transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-slate-800 flex-shrink-0',
        sidebarCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CRM Pro</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-1 transition-colors',
            sidebarCollapsed && 'hidden'
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
                sidebarCollapsed && 'justify-center px-2'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
            {!sidebarCollapsed && to === '/calls' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Mock Telephony Controls */}
      {!sidebarCollapsed && (
        <div className="px-2 py-3 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-500 px-3 uppercase tracking-wider font-semibold">Демо режим</p>
          <button
            onClick={simulateIncomingCall}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Входящий звонок</span>
          </button>
        </div>
      )}

      {/* Toggle button when collapsed */}
      {sidebarCollapsed && (
        <div className="px-2 py-3 border-t border-slate-800">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-t border-slate-800 flex-shrink-0',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {currentUser ? getInitials(currentUser.fullName) : 'U'}
        </div>
        {!sidebarCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser?.fullName}</p>
              <p className="text-slate-400 text-xs truncate">{getRoleLabel(currentUser?.role ?? '')}</p>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
