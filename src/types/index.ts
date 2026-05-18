// ============================================
// Основные типы данных CRM системы
// ============================================

export type UserRole = 'admin' | 'manager' | 'operator';
export type CallType = 'incoming' | 'outgoing';
export type CallStatus = 'pending' | 'active' | 'completed' | 'missed' | 'failed';
export type RecordingStatus = 'pending' | 'downloaded' | 'processed' | 'failed';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ActivityType = 'call' | 'meeting' | 'task' | 'note';
export type TaskPriority = 'low' | 'medium' | 'high';

// -----------------------------------------------
// Пользователь системы
// -----------------------------------------------
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

// -----------------------------------------------
// Контакт / Клиент
// -----------------------------------------------
export interface ContactPhone {
  number: string;
  type: 'mobile' | 'work' | 'home' | 'other';
  isPrimary?: boolean;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  position?: string;
  emails: string[];
  phones: ContactPhone[];
  tags: string[];
  source?: string;
  website?: string;
  telegramHandle?: string;
  notes?: string;
  score: number; // 0-100 lead score
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, string>;
}

// -----------------------------------------------
// Звонок
// -----------------------------------------------
export interface Call {
  id: string;
  contactId?: string;
  contact?: Contact;
  userId: string;
  user?: User;
  type: CallType;
  status: CallStatus;
  phoneNumber: string;
  duration: number; // seconds
  startedAt: string;
  endedAt?: string;
  recordingUrl?: string;
  recordingStatus: RecordingStatus;
  providerCallId?: string;
  providerName: string;
  analysisStatus: AnalysisStatus;
  analysis?: CallAnalysis;
  notes?: string;
}

// -----------------------------------------------
// ИИ-анализ звонка
// -----------------------------------------------
export interface TranscriptSegment {
  speaker: 'operator' | 'client';
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface ExtractedEntities {
  product?: string;
  amount?: string;
  date?: string;
  nextAction?: string;
}

export interface CallAnalysis {
  id: string;
  callId: string;
  transcription: TranscriptSegment[];
  summary: string;
  sentiment: Sentiment;
  score: number; // 0-100 purchase probability
  objections: string[];
  checklistPassed: string[];
  checklistFailed: string[];
  entities: ExtractedEntities;
  modelUsed: string;
  processedAt: string;
  rawText?: string;
}

// -----------------------------------------------
// Активности / История взаимодействий
// -----------------------------------------------
export interface Activity {
  id: string;
  contactId: string;
  userId: string;
  user?: User;
  type: ActivityType;
  callId?: string;
  description: string;
  dueDate?: string;
  completed: boolean;
  priority: TaskPriority;
  createdAt: string;
}

// -----------------------------------------------
// Dashboard аналитика
// -----------------------------------------------
export interface DashboardStats {
  totalContacts: number;
  totalCalls: number;
  callsToday: number;
  avgCallDuration: number;
  conversionRate: number;
  activeManagers: number;
}

export interface CallsByDay {
  date: string;
  incoming: number;
  outgoing: number;
  missed: number;
}

export interface ManagerStats {
  userId: string;
  name: string;
  totalCalls: number;
  avgScore: number;
  avgDuration: number;
  conversionRate: number;
  positiveCalls: number;
}

// -----------------------------------------------
// WebSocket события
// -----------------------------------------------
export type WSEventType =
  | 'incoming_call'
  | 'call_started'
  | 'call_ended'
  | 'analysis_complete'
  | 'notification';

export interface WSEvent {
  type: WSEventType;
  payload: WSIncomingCall | WSCallStarted | WSCallEnded | WSAnalysisComplete | WSNotification;
}

export interface WSIncomingCall {
  callId: string;
  phone: string;
  contactId?: string;
  contact?: Contact;
}

export interface WSCallStarted {
  callId: string;
  contactId?: string;
}

export interface WSCallEnded {
  callId: string;
  duration: number;
  recordingUrl?: string;
}

export interface WSAnalysisComplete {
  callId: string;
  summary: string;
  score: number;
  sentiment: Sentiment;
}

export interface WSNotification {
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

// -----------------------------------------------
// Форма авторизации
// -----------------------------------------------
export interface LoginForm {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
