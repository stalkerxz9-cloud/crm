import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Phone, Bot, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TEST_CREDENTIALS } from '../data/mockData';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Имитация сетевого запроса
    await new Promise((r) => setTimeout(r, 600));

    const success = login(email, password);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Неверный email или пароль');
    }
  };

  const quickLogin = (cred: (typeof TEST_CREDENTIALS)[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  const features = [
    { icon: Phone, text: 'Интеграция с телефонией MCN Telecom' },
    { icon: Bot, text: 'ИИ-аналитика звонков (Yandex SpeechSense)' },
    { icon: Shield, text: 'Ролевой доступ и защита данных' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">CRM Pro</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Умная CRM<br />для вашего бизнеса
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            Управляйте клиентами, звонками и аналитикой в одной системе
          </p>

          {/* Feature list */}
          <div className="space-y-4 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div className="h-9 w-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '10k+', label: 'Звонков в день' },
              { value: '98%', label: 'Точность ИИ' },
              { value: '3x', label: 'Рост конверсии' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">CRM Pro</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Вход в систему</h2>
          <p className="text-slate-500 text-sm mb-8">Введите ваши данные для авторизации</p>

          {/* Quick login buttons */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Быстрый вход (демо)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TEST_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => quickLogin(cred)}
                  className="px-3 py-2 text-xs bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-lg text-slate-600 hover:text-violet-700 transition-all font-medium"
                >
                  {cred.role}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-500">или введите данные вручную</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crmpro.ru"
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm shadow-violet-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Вход...
                </span>
              ) : 'Войти в систему'}
            </button>
          </form>

          {/* Test accounts hint */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2">Тестовые аккаунты:</p>
            <div className="space-y-1.5">
              {TEST_CREDENTIALS.map((c) => (
                <div key={c.email} className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{c.role}:</span>{' '}
                  {c.email} / {c.password}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
