import { useState, useMemo } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play,
  Bot, Search, RefreshCw, ChevronDown, ChevronUp,
  Mic, Clock, AlertCircle, CheckCircle, Loader2,
  MessageSquare, Eye,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  formatDuration, formatDateTime, formatRelativeTime,
  getScoreBg, getSentimentColor, getSentimentLabel,
} from '../utils/formatters';
import type { Call } from '../types';

type FilterStatus = 'all' | 'completed' | 'missed' | 'active';
type FilterType = 'all' | 'incoming' | 'outgoing';

export function CallsPage() {
  const { calls, contacts, makeCall, simulateAnalysisComplete, updateCall } = useStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [dialNumber, setDialNumber] = useState('');
  const [showDialer, setShowDialer] = useState(false);
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return calls.filter((call) => {
      const contact = contacts.find((c) => c.id === call.contactId);
      const matchSearch =
        !q ||
        call.phoneNumber.includes(q) ||
        (contact && `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(q));
      const matchStatus = filterStatus === 'all' || call.status === filterStatus;
      const matchType = filterType === 'all' || call.type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [calls, contacts, search, filterStatus, filterType]);

  const handleMakeCall = () => {
    if (dialNumber.trim()) {
      makeCall(dialNumber.trim());
      setShowDialer(false);
      setDialNumber('');
    }
  };

  const handleReanalyze = (callId: string) => {
    updateCall(callId, { analysisStatus: 'processing' });
    setTimeout(() => simulateAnalysisComplete(callId), 3000);
  };

  const getCallIcon = (call: Call) => {
    if (call.status === 'missed') return <PhoneMissed className="h-4 w-4" />;
    if (call.type === 'incoming') return <PhoneIncoming className="h-4 w-4" />;
    return <PhoneOutgoing className="h-4 w-4" />;
  };

  const getCallColor = (call: Call) => {
    if (call.status === 'missed') return 'text-red-500 bg-red-50';
    if (call.type === 'incoming') return 'text-emerald-600 bg-emerald-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStatusBadge = (call: Call) => {
    if (call.status === 'active') return <Badge variant="success" size="sm">● Активный</Badge>;
    if (call.status === 'missed') return <Badge variant="danger" size="sm">Пропущен</Badge>;
    if (call.status === 'completed') return <Badge variant="info" size="sm">Завершён</Badge>;
    return <Badge variant="default" size="sm">{call.status}</Badge>;
  };

  const getAnalysisBadge = (call: Call) => {
    if (call.analysisStatus === 'completed') return <Badge variant="purple" size="sm">ИИ готов</Badge>;
    if (call.analysisStatus === 'processing') return <Badge variant="warning" size="sm">Обработка...</Badge>;
    if (call.analysisStatus === 'failed') return <Badge variant="danger" size="sm">Ошибка ИИ</Badge>;
    return <Badge variant="default" size="sm">Ожидает</Badge>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Журнал звонков</h2>
          <p className="text-sm text-slate-500 mt-0.5">{calls.length} записей в базе</p>
        </div>
        <Button icon={<Phone className="h-4 w-4" />} onClick={() => setShowDialer(true)}>
          Позвонить
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру или имени..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Статус:</span>
          {(['all', 'completed', 'missed', 'active'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s === 'all' ? 'Все' : s === 'completed' ? 'Завершённые' : s === 'missed' ? 'Пропущенные' : 'Активные'}
            </button>
          ))}
          <span className="text-xs text-slate-500 font-medium ml-2">Тип:</span>
          {(['all', 'incoming', 'outgoing'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterType === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {t === 'all' ? 'Все' : t === 'incoming' ? 'Входящие' : 'Исходящие'}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} из {calls.length}</span>
        </div>
      </div>

      {/* Calls list */}
      <div className="space-y-3">
        {filtered.map((call) => {
          const contact = contacts.find((c) => c.id === call.contactId);
          const analysis = call.analysis;

          return (
            <div
              key={call.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-sm transition-all duration-200"
            >
              {/* Main row */}
              <div className="p-4 flex items-center gap-4">
                {/* Call type icon */}
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${getCallColor(call)}`}>
                  {getCallIcon(call)}
                </div>

                {/* Contact info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">
                      {contact ? `${contact.firstName} ${contact.lastName}` : 'Неизвестный'}
                    </span>
                    <span className="text-xs text-slate-400">{call.phoneNumber}</span>
                    {getStatusBadge(call)}
                    {getAnalysisBadge(call)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(call.startedAt)}
                    </span>
                    {call.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {formatDuration(call.duration)}
                      </span>
                    )}
                    <span>{call.providerName}</span>
                  </div>
                </div>

                {/* AI score */}
                {analysis && (
                  <div className="flex-shrink-0 text-center hidden sm:block">
                    <div className={`text-lg font-bold ${analysis.score >= 70 ? 'text-emerald-600' : analysis.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                      {analysis.score}%
                    </div>
                    <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full ${getSentimentColor(analysis.sentiment)}`}>
                      {getSentimentLabel(analysis.sentiment)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {call.recordingUrl && (
                    <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors" title="Прослушать запись">
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {call.analysisStatus === 'completed' && (
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-violet-600 text-slate-500 transition-colors"
                      title="Просмотр ИИ-анализа"
                    >
                      <Bot className="h-4 w-4" />
                    </button>
                  )}
                  {call.analysisStatus !== 'processing' && call.status === 'completed' && (
                    <button
                      onClick={() => handleReanalyze(call.id)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
                      title="Повторный анализ"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  {call.analysisStatus === 'processing' && (
                    <div className="p-1.5 text-violet-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Analysis summary strip */}
              {analysis && (
                <div className="px-4 pb-3 border-t border-slate-50 pt-2">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    <span className="font-medium text-violet-600">ИИ: </span>
                    {analysis.summary}
                  </p>
                  {analysis.objections.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span className="text-xs text-red-500 font-medium">Возражения:</span>
                      {analysis.objections.map((o, i) => (
                        <span key={i} className="text-xs text-slate-500 bg-red-50 px-1.5 py-0.5 rounded">
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <Phone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Звонки не найдены</p>
            <p className="text-sm text-slate-400 mt-1">Попробуйте изменить фильтры</p>
          </div>
        )}
      </div>

      {/* Dialer Modal */}
      <Modal
        isOpen={showDialer}
        onClose={() => setShowDialer(false)}
        title="Исходящий звонок"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDialer(false)}>Отмена</Button>
            <Button variant="success" icon={<Phone className="h-4 w-4" />} onClick={handleMakeCall} disabled={!dialNumber.trim()}>
              Позвонить
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Введите номер телефона. В демо-режиме используется мок-провайдер MCN Telecom.
          </p>
          <input
            type="tel"
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMakeCall()}
            placeholder="+7 (999) 000-00-00"
            autoFocus
            className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-center font-mono"
          />
          {/* Dialpad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
              <button
                key={d}
                onClick={() => setDialNumber((p) => p + d)}
                className="py-3 text-lg font-medium bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDialNumber((p) => p.slice(0, -1))}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            ← Удалить
          </button>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            🔧 <strong>Демо-режим:</strong> Звонок будет симулирован. ИИ-анализ запустится автоматически через ~8 секунд после завершения.
          </div>
        </div>
      </Modal>

      {/* Call Detail Modal */}
      {selectedCall && (
        <Modal
          isOpen={!!selectedCall}
          onClose={() => { setSelectedCall(null); setExpandedTranscript(false); }}
          title={`Детали звонка — ${selectedCall.phoneNumber}`}
          size="xl"
          footer={
            <>
              <Button variant="outline" onClick={() => { setSelectedCall(null); setExpandedTranscript(false); }}>
                Закрыть
              </Button>
              {selectedCall.status === 'completed' && (
                <Button
                  variant="secondary"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => { handleReanalyze(selectedCall.id); setSelectedCall(null); }}
                >
                  Перезапустить ИИ
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-5">
            {/* Call info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Тип', value: selectedCall.type === 'incoming' ? 'Входящий' : 'Исходящий' },
                { label: 'Статус', value: selectedCall.status === 'completed' ? 'Завершён' : selectedCall.status === 'missed' ? 'Пропущен' : selectedCall.status },
                { label: 'Длительность', value: selectedCall.duration > 0 ? formatDuration(selectedCall.duration) : '—' },
                { label: 'Провайдер', value: selectedCall.providerName },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Начало: </span><span className="text-slate-800">{formatDateTime(selectedCall.startedAt)}</span></div>
              {selectedCall.endedAt && <div><span className="text-slate-400">Конец: </span><span className="text-slate-800">{formatDateTime(selectedCall.endedAt)}</span></div>}
              <div><span className="text-slate-400">ID провайдера: </span><span className="font-mono text-xs text-slate-600">{selectedCall.providerCallId}</span></div>
              <div><span className="text-slate-400">Статус записи: </span><span className="text-slate-800">{selectedCall.recordingStatus}</span></div>
            </div>

            {/* Recording player */}
            {selectedCall.recordingUrl && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-violet-500" />
                  Запись разговора
                </p>
                <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                  <button className="h-8 w-8 bg-violet-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:bg-violet-700 transition-colors">
                    <Play className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                    <div className="h-full w-1/3 bg-violet-500 rounded-full" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{formatDuration(selectedCall.duration)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Запись хранится на защищённом сервере. URL: <span className="font-mono">{selectedCall.recordingUrl}</span>
                </p>
              </div>
            )}

            {/* AI Analysis */}
            {selectedCall.analysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Bot className="h-5 w-5 text-violet-600" />
                  <h3 className="font-semibold text-slate-900">ИИ-анализ звонка</h3>
                  <Badge variant="purple" size="sm">{selectedCall.analysis.modelUsed}</Badge>
                </div>

                {/* Score + Sentiment */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`rounded-xl p-4 text-center border ${getScoreBg(selectedCall.analysis.score)}`}>
                    <div className="text-3xl font-bold">{selectedCall.analysis.score}%</div>
                    <div className="text-xs mt-1">Вероятность сделки</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${getSentimentColor(selectedCall.analysis.sentiment)}`}>
                    <div className="text-2xl">
                      {selectedCall.analysis.sentiment === 'positive' ? '😊' :
                       selectedCall.analysis.sentiment === 'negative' ? '😟' : '😐'}
                    </div>
                    <div className="text-sm font-semibold mt-1">{getSentimentLabel(selectedCall.analysis.sentiment)}</div>
                    <div className="text-xs mt-0.5">Настроение клиента</div>
                  </div>
                  <div className="rounded-xl p-4 bg-blue-50 text-blue-700 text-center">
                    <div className="text-2xl font-bold">{selectedCall.analysis.checklistPassed.length}/{selectedCall.analysis.checklistPassed.length + selectedCall.analysis.checklistFailed.length}</div>
                    <div className="text-xs mt-1">Пунктов скрипта</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1.5">Краткое резюме</p>
                  <p className="text-sm text-slate-700">{selectedCall.analysis.summary}</p>
                </div>

                {/* Entities */}
                {Object.keys(selectedCall.analysis.entities).length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCall.analysis.entities.product && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Продукт</p>
                        <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedCall.analysis.entities.product}</p>
                      </div>
                    )}
                    {selectedCall.analysis.entities.amount && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Сумма / Бюджет</p>
                        <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedCall.analysis.entities.amount}</p>
                      </div>
                    )}
                    {selectedCall.analysis.entities.date && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Дата</p>
                        <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedCall.analysis.entities.date}</p>
                      </div>
                    )}
                    {selectedCall.analysis.entities.nextAction && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Следующее действие</p>
                        <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedCall.analysis.entities.nextAction}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Objections */}
                {selectedCall.analysis.objections.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Возражения клиента</p>
                    <ul className="space-y-1">
                      {selectedCall.analysis.objections.map((obj, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedCall.analysis.checklistPassed.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">✅ Выполнено по скрипту</p>
                      <ul className="space-y-1">
                        {selectedCall.analysis.checklistPassed.map((item, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCall.analysis.checklistFailed.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">❌ Не выполнено</p>
                      <ul className="space-y-1">
                        {selectedCall.analysis.checklistFailed.map((item, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Transcript */}
                {selectedCall.analysis.transcription.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedTranscript(!expandedTranscript)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors w-full"
                    >
                      <MessageSquare className="h-4 w-4 text-violet-500" />
                      Транскрипция разговора
                      {expandedTranscript ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                    </button>
                    {expandedTranscript && (
                      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {selectedCall.analysis.transcription.map((seg, i) => (
                          <div
                            key={i}
                            className={`flex gap-3 ${seg.speaker === 'operator' ? 'flex-row' : 'flex-row-reverse'}`}
                          >
                            <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${seg.speaker === 'operator' ? 'bg-violet-500' : 'bg-blue-500'}`}>
                              {seg.speaker === 'operator' ? 'О' : 'К'}
                            </div>
                            <div className={`max-w-[75%] rounded-xl px-3 py-2 ${seg.speaker === 'operator' ? 'bg-white border border-slate-200' : 'bg-blue-50 border border-blue-100'}`}>
                              <p className="text-xs text-slate-700">{seg.text}</p>
                              <p className="text-xs text-slate-400 mt-1">{seg.startTime}s — {seg.endTime}s</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : selectedCall.analysisStatus === 'processing' ? (
              <div className="flex items-center gap-3 py-6 justify-center">
                <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                <p className="text-slate-600">ИИ анализирует разговор...</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Bot className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">ИИ-анализ ещё не выполнен</p>
                {selectedCall.status === 'completed' && (
                  <button
                    onClick={() => { handleReanalyze(selectedCall.id); setSelectedCall(null); }}
                    className="mt-3 text-violet-600 hover:text-violet-700 text-sm font-medium"
                  >
                    Запустить анализ →
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
