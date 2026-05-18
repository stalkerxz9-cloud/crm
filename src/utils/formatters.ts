// ============================================
// Утилиты форматирования
// ============================================

/**
 * Форматирует длительность в секундах в строку MM:SS или HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Форматирует дату/время в русском формате
 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматирует дату в краткий формат
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Относительное время (например, "5 минут назад")
 */
export function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return formatDate(iso);
}

/**
 * Получить инициалы из полного имени
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Форматирует номер телефона в красивый вид
 */
export function formatPhone(phone: string): string {
  return phone;
}

/**
 * Возвращает цвет для оценки (score)
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
}

/**
 * Возвращает цвет фона для оценки
 */
export function getScoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

/**
 * Метка для sentiment
 */
export function getSentimentLabel(sentiment: string): string {
  const map: Record<string, string> = {
    positive: 'Позитивное',
    neutral: 'Нейтральное',
    negative: 'Негативное',
  };
  return map[sentiment] ?? sentiment;
}

/**
 * Цвет для sentiment
 */
export function getSentimentColor(sentiment: string): string {
  const map: Record<string, string> = {
    positive: 'text-emerald-600 bg-emerald-50',
    neutral: 'text-amber-600 bg-amber-50',
    negative: 'text-red-600 bg-red-50',
  };
  return map[sentiment] ?? 'text-slate-600 bg-slate-50';
}

/**
 * Метка для статуса звонка
 */
export function getCallStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Ожидание',
    active: 'Активный',
    completed: 'Завершён',
    missed: 'Пропущен',
    failed: 'Ошибка',
  };
  return map[status] ?? status;
}

/**
 * Метка для типа звонка
 */
export function getCallTypeLabel(type: string): string {
  return type === 'incoming' ? 'Входящий' : 'Исходящий';
}

/**
 * Метка для роли пользователя
 */
export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'Администратор',
    manager: 'Менеджер',
    operator: 'Оператор',
  };
  return map[role] ?? role;
}

/**
 * Метка для типа активности
 */
export function getActivityTypeLabel(type: string): string {
  const map: Record<string, string> = {
    call: 'Звонок',
    meeting: 'Встреча',
    task: 'Задача',
    note: 'Заметка',
  };
  return map[type] ?? type;
}

/**
 * Сокращение длинного текста
 */
export function truncate(text: string, maxLen: number = 100): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}
