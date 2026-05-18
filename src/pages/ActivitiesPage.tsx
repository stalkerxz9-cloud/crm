import { useState, useMemo } from 'react';
import {
  Plus, Phone, Calendar, FileText, CheckSquare, CheckCircle2,
  Circle, Trash2, AlertTriangle, Clock,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatDateTime, formatRelativeTime, getActivityTypeLabel } from '../utils/formatters';
import type { ActivityType, TaskPriority } from '../types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  call: 'text-blue-600 bg-blue-50',
  meeting: 'text-violet-600 bg-violet-50',
  task: 'text-amber-600 bg-amber-50',
  note: 'text-slate-600 bg-slate-50',
};

const PRIORITY_BADGE: Record<TaskPriority, React.ReactElement> = {
  high: <Badge variant="danger" size="sm">Высокий</Badge>,
  medium: <Badge variant="warning" size="sm">Средний</Badge>,
  low: <Badge variant="default" size="sm">Низкий</Badge>,
};

interface ActivityForm {
  contactId: string;
  type: ActivityType;
  description: string;
  dueDate: string;
  priority: TaskPriority;
}

const EMPTY_FORM: ActivityForm = {
  contactId: '',
  type: 'task',
  description: '',
  dueDate: '',
  priority: 'medium',
};

export function ActivitiesPage() {
  const { activities, contacts, currentUser, addActivity, updateActivity, deleteActivity } = useStore();

  const [filterType, setFilterType] = useState<'all' | ActivityType>('all');
  const [filterDone, setFilterDone] = useState<'all' | 'done' | 'pending'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ActivityForm>(EMPTY_FORM);


  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchType = filterType === 'all' || a.type === filterType;
      const matchDone =
        filterDone === 'all' ||
        (filterDone === 'done' && a.completed) ||
        (filterDone === 'pending' && !a.completed);
      return matchType && matchDone;
    });
  }, [activities, filterType, filterDone]);

  const overdueCount = activities.filter(
    (a) => !a.completed && a.dueDate && new Date(a.dueDate) < new Date()
  ).length;

  const handleSave = () => {
    if (!form.description.trim() || !form.contactId) return;
    addActivity({
      contactId: form.contactId,
      userId: currentUser?.id ?? 'u1',
      type: form.type,
      description: form.description.trim(),
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      completed: false,
    });
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const contactOptions = [
    { value: '', label: 'Выберите контакт...' },
    ...contacts.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}${c.company ? ` (${c.company})` : ''}` })),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Активности</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {activities.filter((a) => !a.completed).length} активных задач
            {overdueCount > 0 && (
              <span className="ml-2 text-red-500 font-medium">• {overdueCount} просрочено</span>
            )}
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>
          Добавить активность
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { type: 'task', label: 'Задачи', color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { type: 'call', label: 'Звонки', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { type: 'meeting', label: 'Встречи', color: 'bg-violet-50 border-violet-200 text-violet-700' },
          { type: 'note', label: 'Заметки', color: 'bg-slate-50 border-slate-200 text-slate-700' },
        ] as const).map((s) => (
          <button
            key={s.type}
            onClick={() => setFilterType(filterType === s.type ? 'all' : s.type)}
            className={`rounded-xl border p-3 text-center transition-all ${filterType === s.type ? s.color + ' ring-2 ring-offset-1 ring-violet-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
          >
            <div className="text-xl font-bold text-slate-900">
              {activities.filter((a) => a.type === s.type).length}
            </div>
            <div className="text-xs font-medium mt-0.5 text-slate-600">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Тип:</span>
          {(['all', 'task', 'call', 'meeting', 'note'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterType === t ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {t === 'all' ? 'Все' : getActivityTypeLabel(t)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-slate-500 font-medium">Статус:</span>
          {(['all', 'pending', 'done'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilterDone(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterDone === d ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {d === 'all' ? 'Все' : d === 'pending' ? 'Активные' : 'Завершённые'}
            </button>
          ))}
        </div>
      </div>

      {/* Activities list */}
      <div className="space-y-2">
        {filtered.map((activity) => {
          const contact = contacts.find((c) => c.id === activity.contactId);
          const isOverdue = !activity.completed && activity.dueDate && new Date(activity.dueDate) < new Date();

          return (
            <div
              key={activity.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all ${
                activity.completed
                  ? 'border-slate-100 opacity-75'
                  : isOverdue
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => updateActivity(activity.id, { completed: !activity.completed })}
                className={`mt-0.5 flex-shrink-0 transition-colors ${activity.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}`}
              >
                {activity.completed
                  ? <CheckCircle2 className="h-5 w-5" />
                  : <Circle className="h-5 w-5" />}
              </button>

              {/* Type icon */}
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${TYPE_COLORS[activity.type]}`}>
                {TYPE_ICONS[activity.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${activity.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {activity.description}
                  </p>
                  {PRIORITY_BADGE[activity.priority]}
                  {isOverdue && (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Просрочено
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  {contact && (
                    <span className="font-medium text-slate-600">
                      {contact.firstName} {contact.lastName}
                      {contact.company && ` • ${contact.company}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                  {activity.dueDate && (
                    <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-500' : 'text-slate-600'}`}>
                      <Calendar className="h-3 w-3" />
                      до {formatDateTime(activity.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Активности не найдены</p>
            <Button className="mt-4" size="sm" onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>
              Добавить первую активность
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setForm(EMPTY_FORM); }}
        title="Новая активность"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>Отмена</Button>
            <Button onClick={handleSave} disabled={!form.description.trim() || !form.contactId}>
              Создать
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Контакт *"
            value={form.contactId}
            onChange={(e) => setForm({ ...form, contactId: e.target.value })}
            options={contactOptions}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Тип *"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}
              options={[
                { value: 'task', label: 'Задача' },
                { value: 'call', label: 'Звонок' },
                { value: 'meeting', label: 'Встреча' },
                { value: 'note', label: 'Заметка' },
              ]}
            />
            <Select
              label="Приоритет"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              options={[
                { value: 'high', label: 'Высокий' },
                { value: 'medium', label: 'Средний' },
                { value: 'low', label: 'Низкий' },
              ]}
            />
          </div>
          <Textarea
            label="Описание *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Что нужно сделать?"
            rows={3}
          />
          <Input
            label="Срок выполнения"
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
