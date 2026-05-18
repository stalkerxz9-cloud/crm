import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

export function Layout() {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <TopBar />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-60'
        )}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
