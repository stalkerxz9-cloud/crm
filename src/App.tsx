import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactsPage } from './pages/ContactsPage';
import { CallsPage } from './pages/CallsPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useStore } from './store/useStore';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Incoming call overlay (global WebSocket-like notification)
function IncomingCallOverlay() {
  const { activeCallId, calls } = useStore();
  const activeCall = calls.find((c) => c.id === activeCallId && c.type === 'incoming' && c.status === 'active');

  if (!activeCall) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-72 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-600 text-lg">📞</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Входящий звонок</p>
          <p className="text-sm font-bold text-slate-900 truncate">
            {activeCall.contact
              ? `${activeCall.contact.firstName} ${activeCall.contact.lastName}`
              : 'Неизвестный'}
          </p>
          <p className="text-xs text-slate-500">{activeCall.phoneNumber}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">
          ✓ Принять
        </button>
        <button className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors">
          ✕ Отклонить
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, addNotification } = useStore();

  // WebSocket simulation: периодически симулируем события от сервера
  useEffect(() => {
    if (!isAuthenticated) return;

    // Приветственное уведомление
    const welcomeTimer = setTimeout(() => {
      addNotification({
        type: 'info',
        title: '🚀 Система запущена',
        message: 'CRM Pro работает в демо-режиме. Нажмите «Входящий звонок» для тестирования.',
      });
    }, 1000);

    return () => clearTimeout(welcomeTimer);
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="calls" element={<CallsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>

      {/* Global overlays */}
      {isAuthenticated && <IncomingCallOverlay />}

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  );
}
