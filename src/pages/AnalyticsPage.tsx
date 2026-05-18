import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { MOCK_CALLS_BY_DAY, MOCK_MANAGER_STATS } from '../data/mockData';
import { formatDuration, getScoreBg } from '../utils/formatters';
import { TrendingUp, Phone, Clock, Bot } from 'lucide-react';

const sentimentData = [
  { name: 'Позитивные', value: 52, color: '#10b981' },
  { name: 'Нейтральные', value: 33, color: '#f59e0b' },
  { name: 'Негативные', value: 15, color: '#ef4444' },
];

const conversionData = [
  { week: 'Нед 1', conversion: 58, calls: 34 },
  { week: 'Нед 2', conversion: 62, calls: 41 },
  { week: 'Нед 3', conversion: 55, calls: 38 },
  { week: 'Нед 4', conversion: 71, calls: 52 },
  { week: 'Нед 5', conversion: 67, calls: 47 },
  { week: 'Нед 6', conversion: 74, calls: 55 },
];

const durationData = [
  { range: '< 1 мин', count: 8 },
  { range: '1-3 мин', count: 22 },
  { range: '3-7 мин', count: 35 },
  { range: '7-15 мин', count: 18 },
  { range: '> 15 мин', count: 7 },
];

const topWords = [
  { word: 'цена', count: 87 },
  { word: 'интеграция', count: 72 },
  { word: 'демо', count: 65 },
  { word: 'скидка', count: 58 },
  { word: 'договор', count: 51 },
  { word: 'срок', count: 48 },
  { word: 'бюджет', count: 44 },
  { word: 'функционал', count: 39 },
  { word: 'техподдержка', count: 35 },
  { word: 'безопасность', count: 31 },
  { word: 'облако', count: 28 },
  { word: 'API', count: 24 },
];

export function AnalyticsPage() {
  const { calls } = useStore();

  const completedCalls = calls.filter((c) => c.status === 'completed');
  const analyzedCalls = calls.filter((c) => c.analysisStatus === 'completed' && c.analysis);
  const avgScore = analyzedCalls.length > 0
    ? Math.round(analyzedCalls.reduce((s, c) => s + (c.analysis?.score ?? 0), 0) / analyzedCalls.length)
    : 0;
  const avgDuration = completedCalls.length > 0
    ? Math.round(completedCalls.reduce((s, c) => s + c.duration, 0) / completedCalls.length)
    : 0;

  const summaryStats = [
    { label: 'Всего звонков', value: calls.length, icon: Phone, color: 'text-blue-600 bg-blue-50', change: '+14%' },
    { label: 'Конверсия', value: '67%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', change: '+7%' },
    { label: 'Ср. оценка ИИ', value: `${avgScore}%`, icon: Bot, color: 'text-violet-600 bg-violet-50', change: '+3%' },
    { label: 'Ср. длительность', value: formatDuration(avgDuration || 292), icon: Clock, color: 'text-amber-600 bg-amber-50', change: '-1%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Аналитика</h2>
        <p className="text-sm text-slate-500 mt-0.5">Сводная статистика по звонкам и менеджерам</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${s.color.split(' ')[1]}`}>
                <s.icon className={`h-5 w-5 ${s.color.split(' ')[0]}`} />
              </div>
              <span className="text-xs font-medium text-emerald-600">{s.change}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls by day */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-base font-semibold text-slate-900">Динамика звонков</h3>
            <p className="text-xs text-slate-500">Последние 7 дней</p>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_CALLS_BY_DAY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="incoming" name="Входящие" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outgoing" name="Исходящие" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="missed" name="Пропущенные" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversion trend */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-base font-semibold text-slate-900">Конверсия по неделям</h3>
            <p className="text-xs text-slate-500">% успешных звонков</p>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[40, 80]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v) => [`${v}%`, 'Конверсия']} />
                <Line type="monotone" dataKey="conversion" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Duration distribution */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-base font-semibold text-slate-900">Длительность звонков</h3>
            <p className="text-xs text-slate-500">Распределение</p>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={durationData} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={55} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" name="Звонков" fill="#7c3aed" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sentiment pie */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Тональность</h3>
          <p className="text-xs text-slate-500 mb-3">Результаты ИИ-анализа</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
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
                  <span className="text-slate-600 text-xs">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-900 text-sm">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Word cloud */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Топ-слова из разговоров</h3>
          <p className="text-xs text-slate-500 mb-4">Часто упоминаемые темы</p>
          <div className="flex flex-wrap gap-2">
            {topWords.map((w) => {
              const size = w.count > 70 ? 'text-base font-bold' : w.count > 50 ? 'text-sm font-semibold' : 'text-xs font-medium';
              const opacity = w.count > 70 ? 'text-violet-700 bg-violet-100' : w.count > 50 ? 'text-blue-700 bg-blue-50' : 'text-slate-600 bg-slate-100';
              return (
                <span key={w.word} className={`px-2 py-1 rounded-lg ${size} ${opacity} cursor-default`} title={`${w.count} упоминаний`}>
                  {w.word}
                </span>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Managers table */}
      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Показатели менеджеров</h3>
          <p className="text-xs text-slate-500 mt-0.5">Сравнительная аналитика за текущий месяц</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['#', 'Менеджер', 'Звонков', 'Конверсия', 'Оценка ИИ', 'Ср. длина', 'Позитивных', 'Прогресс'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_MANAGER_STATS.map((m, idx) => (
                <tr key={m.userId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-orange-400'}`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {m.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700 font-medium">{m.totalCalls}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full border ${getScoreBg(m.conversionRate)}`}>
                      {m.conversionRate}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full border ${getScoreBg(m.avgScore)}`}>
                      {m.avgScore}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{formatDuration(m.avgDuration)}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{m.positiveCalls}</td>
                  <td className="px-5 py-4">
                    <div className="w-24">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${m.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: '🎯',
            title: 'Лучшее время для звонков',
            value: '10:00 — 12:00',
            desc: 'Наибольшая конверсия в первой половине дня',
            color: 'bg-violet-50 border-violet-200',
          },
          {
            icon: '⚠️',
            title: 'Частое возражение',
            value: 'Высокая цена',
            desc: '38% звонков содержат возражение по цене',
            color: 'bg-amber-50 border-amber-200',
          },
          {
            icon: '📈',
            title: 'Тренд конверсии',
            value: '+7% за месяц',
            desc: 'Позитивная динамика относительно прошлого месяца',
            color: 'bg-emerald-50 border-emerald-200',
          },
        ].map((insight) => (
          <div key={insight.title} className={`rounded-xl border p-4 ${insight.color}`}>
            <div className="text-2xl mb-2">{insight.icon}</div>
            <p className="text-xs text-slate-500 font-medium">{insight.title}</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{insight.value}</p>
            <p className="text-xs text-slate-600 mt-1">{insight.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
