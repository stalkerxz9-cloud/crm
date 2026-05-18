
import {
  Users, Phone, TrendingUp, Clock, PhoneIncoming, PhoneOutgoing,
  PhoneMissed, Bot, ArrowUpRight, ArrowDownRight, Star,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  MOCK_CALLS_BY_DAY,
  MOCK_MANAGER_STATS,
  MOCK_DASHBOARD_STATS,
} from '../data/mockData';
import { formatDuration, getScoreBg } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const sentimentData = [
  { name: 'Позитивные', value: 52, color: '#10b981' },
  { name: 'Нейтральные', value: 33, color: '#f59e0b' },
  { name: 'Негативные', value: 15, color: '#ef4444' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { calls, contacts, simulateIncomingCall } = useStore();

  const todayCalls = calls.filter(c => {
    const d = new Date(c.startedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const completedCalls = calls.filter(c => c.status === 'completed');
  const missedCalls = calls.filter(c => c.status === 'missed');
  const analyzedCalls = calls.filter(c => c.analysisStatus === 'completed' && c.analysis);
  const avgScore = analyzedCalls.length > 0
    ? Math.round(analyzedCalls.reduce((s, c) => s + (c.analysis?.score ?? 0), 0) / analyzedCalls.length)
    : 0;

  const stats = [
    {
      label: 'Всего контактов',
      value: contacts.length,
      icon: Users,
      change: '+12%',
      positive: true,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      onClick: () => navigate('/contacts'),
    },
    {
      label: 'Звонков сегодня',
      value: todayCalls.length || MOCK_DASHBOARD_STATS.callsToday,
      icon: Phone,
      change: '+8%',
      positive: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => navigate('/calls'),
    },
    {
      label: 'Конверсия',
      value: `${MOCK_DASHBOARD_STATS.conversionRate}%`,
      icon: TrendingUp,
      change: '+5%',
      positive: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => navigate('/analytics'),
    },
    {
      label: 'Ср. длина звонка',
      value: formatDuration(MOCK_DASHBOARD_STATS.avgCallDuration),
      icon: Clock,
      change: '-2%',
      positive: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      onClick: () => navigate('/analytics'),
    },
  ];

  const callStats = [
    { label: 'Завершены', value: completedCalls.length, icon: Phone, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Пропущены', value: missedCalls.length, icon: PhoneMissed, color: 'text-red-600 bg-red-50' },
    { label: 'Проанализированы ИИ', value: analyzedCalls.length, icon: Bot, color: 'text-violet-600 bg-violet-50' },
    { label: 'Ср. оценка ИИ', value: `${avgScore}%`, icon: Star, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-60 h-60 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Добро пожаловать в CRM Pro! 👋</h2>
            <p className="text-violet-200 text-sm">
              Система работает в демо-режиме. Используйте кнопку «Входящий звонок» в меню для тестирования.
            </p>
          </div>
          <button
            onClick={simulateIncomingCall}
            className="flex-shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <PhoneIncoming className="h-4 w-4" />
            Симулировать звонок
          </button>
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} hover onClick={stat.onClick}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Call stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {callStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${s.color.split(' ')[1]}`}>
              <s.icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calls by day chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Звонки по дням</h3>
              <p className="text-xs text-slate-500 mt-0.5">Последние 7 дней</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Входящие</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Исходящие</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" />Пропущенные</div>
            </div>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_CALLS_BY_DAY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="incoming" name="Входящие" stroke="#7c3aed" fill="#ede9fe" strokeWidth={2} />
                <Area type="monotone" dataKey="outgoing" name="Исходящие" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                <Area type="monotone" dataKey="missed" name="Пропущенные" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sentiment pie */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Тональность звонков</h3>
          <p className="text-xs text-slate-500 mb-4">По результатам ИИ-анализа</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-600">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Managers + Recent calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manager stats */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Рейтинг менеджеров</h3>
          <div className="space-y-3">
            {MOCK_MANAGER_STATS.map((m, idx) => (
              <div key={m.userId} className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-orange-400'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 truncate">{m.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getScoreBg(m.conversionRate)}`}>
                      {m.conversionRate}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      style={{ width: `${m.conversionRate}%` }}
                    />
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    <span>{m.totalCalls} звонков</span>
                    <span>Оценка ИИ: {m.avgScore}%</span>
                    <span>Ср. {formatDuration(m.avgDuration)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent calls */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Последние звонки</h3>
            <button onClick={() => navigate('/calls')} className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              Все звонки <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {calls.slice(0, 5).map((call) => {
              const contact = call.contact;
              const isIncoming = call.type === 'incoming';
              const isMissed = call.status === 'missed';
              return (
                <div key={call.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${
                    isMissed ? 'bg-red-50 text-red-500' :
                    isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {isMissed ? <PhoneMissed className="h-3.5 w-3.5" /> :
                     isIncoming ? <PhoneIncoming className="h-3.5 w-3.5" /> :
                     <PhoneOutgoing className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {contact ? `${contact.firstName} ${contact.lastName}` : call.phoneNumber}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{call.phoneNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {call.analysis && (
                      <Badge variant={
                        call.analysis.sentiment === 'positive' ? 'success' :
                        call.analysis.sentiment === 'negative' ? 'danger' : 'warning'
                      } size="sm">
                        {call.analysis.score}%
                      </Badge>
                    )}
                    {call.duration > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">{formatDuration(call.duration)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
