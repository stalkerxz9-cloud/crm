// ============================================
// Глобальное состояние приложения (Zustand)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Contact,
  Call,
  Activity,
  WSIncomingCall,
} from '../types';
import {
  MOCK_USERS,
  MOCK_CONTACTS,
  MOCK_CALLS,
  MOCK_ACTIVITIES,
} from '../data/mockData';

interface NotificationItem {
  id: string;
  type: 'incoming_call' | 'call_ended' | 'analysis_complete' | 'info';
  title: string;
  message: string;
  payload?: WSIncomingCall;
  timestamp: string;
  read: boolean;
}

interface CRMStore {
  // ---- Аутентификация ----
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // ---- Контакты ----
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;

  // ---- Звонки ----
  calls: Call[];
  addCall: (call: Omit<Call, 'id'>) => Call;
  updateCall: (id: string, updates: Partial<Call>) => void;
  getCallById: (id: string) => Call | undefined;
  makeCall: (phoneNumber: string, contactId?: string) => Call;
  activeCallId: string | null;
  setActiveCall: (callId: string | null) => void;

  // ---- Активности ----
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  getActivitiesByContact: (contactId: string) => Activity[];

  // ---- WebSocket / Уведомления ----
  notifications: NotificationItem[];
  addNotification: (n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;

  // ---- Симуляция WebSocket ----
  simulateIncomingCall: () => void;
  simulateAnalysisComplete: (callId: string) => void;

  // ---- UI State ----
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// Пароли для мок-авторизации
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@crmpro.ru': 'admin123',
  'manager1@crmpro.ru': 'manager123',
  'manager2@crmpro.ru': 'manager123',
  'operator@crmpro.ru': 'operator123',
};

export const useStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      // ============================
      // Аутентификация
      // ============================
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        const expectedPwd = MOCK_PASSWORDS[email];
        if (!expectedPwd || expectedPwd !== password) return false;

        const user = MOCK_USERS.find((u) => u.email === email);
        if (!user) return false;

        set({ currentUser: user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      // ============================
      // Контакты
      // ============================
      contacts: MOCK_CONTACTS,

      addContact: (contactData) => {
        const newContact: Contact = {
          ...contactData,
          id: generateId(),
          score: contactData.score ?? 0,
          tags: contactData.tags ?? [],
          emails: contactData.emails ?? [],
          phones: contactData.phones ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ contacts: [newContact, ...state.contacts] }));
        return newContact;
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        }));
      },

      getContactById: (id) => get().contacts.find((c) => c.id === id),

      // ============================
      // Звонки
      // ============================
      calls: MOCK_CALLS,
      activeCallId: null,

      addCall: (callData) => {
        const newCall: Call = { ...callData, id: generateId() };
        set((state) => ({ calls: [newCall, ...state.calls] }));
        return newCall;
      },

      updateCall: (id, updates) => {
        set((state) => ({
          calls: state.calls.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      getCallById: (id) => get().calls.find((c) => c.id === id),

      setActiveCall: (callId) => set({ activeCallId: callId }),

      /**
       * Симуляция исходящего звонка через "мок-провайдер"
       * В реальной системе — вызов API MCN Telecom / Телфин
       */
      makeCall: (phoneNumber, contactId) => {
        const { currentUser, contacts } = get();
        const contact = contactId ? contacts.find((c) => c.id === contactId) : undefined;

        const newCall: Call = {
          id: generateId(),
          contactId,
          contact,
          userId: currentUser?.id ?? 'unknown',
          type: 'outgoing',
          status: 'active',
          phoneNumber,
          duration: 0,
          startedAt: new Date().toISOString(),
          recordingStatus: 'pending',
          providerCallId: `mcn-mock-${generateId()}`,
          providerName: 'MCN Telecom (Mock)',
          analysisStatus: 'pending',
        };

        set((state) => ({
          calls: [newCall, ...state.calls],
          activeCallId: newCall.id,
        }));

        // Симулируем завершение звонка через 8-15 секунд
        const duration = Math.floor(Math.random() * 420) + 60;
        setTimeout(() => {
          get().updateCall(newCall.id, {
            status: 'completed',
            duration,
            endedAt: new Date().toISOString(),
            recordingStatus: 'downloaded',
            recordingUrl: `https://mock-storage.crmpro.ru/recordings/${newCall.id}.mp3`,
          });
          get().setActiveCall(null);
          get().addNotification({
            type: 'call_ended',
            title: 'Звонок завершён',
            message: `Звонок на ${phoneNumber} завершён. Длительность: ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`,
          });

          // Симулируем запуск ИИ-анализа через 5 секунд после завершения
          setTimeout(() => {
            get().simulateAnalysisComplete(newCall.id);
          }, 5000);
        }, 8000);

        return newCall;
      },

      // ============================
      // Активности
      // ============================
      activities: MOCK_ACTIVITIES,

      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ activities: [newActivity, ...state.activities] }));
        return newActivity;
      },

      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        }));
      },

      getActivitiesByContact: (contactId) =>
        get().activities.filter((a) => a.contactId === contactId),

      // ============================
      // Уведомления
      // ============================
      notifications: [],

      addNotification: (n) => {
        const newNotif: NotificationItem = {
          ...n,
          id: generateId(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      unreadCount: 0,

      // ============================
      // WebSocket симуляция
      // ============================

      /**
       * Симулирует входящий звонок от мок-провайдера
       * В реальной системе — это WebSocket событие от backend
       */
      simulateIncomingCall: () => {
        const { contacts } = get();
        const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
        const phone = randomContact?.phones[0]?.number ?? '+7 (999) 000-00-00';

        const newCall: Call = {
          id: generateId(),
          contactId: randomContact?.id,
          contact: randomContact,
          userId: get().currentUser?.id ?? 'u1',
          type: 'incoming',
          status: 'active',
          phoneNumber: phone,
          duration: 0,
          startedAt: new Date().toISOString(),
          recordingStatus: 'pending',
          providerCallId: `mcn-incoming-${generateId()}`,
          providerName: 'MCN Telecom (Mock)',
          analysisStatus: 'pending',
        };

        set((state) => ({
          calls: [newCall, ...state.calls],
          activeCallId: newCall.id,
        }));

        get().addNotification({
          type: 'incoming_call',
          title: '📞 Входящий звонок!',
          message: `${randomContact ? randomContact.firstName + ' ' + randomContact.lastName : 'Неизвестный'} • ${phone}`,
          payload: {
            callId: newCall.id,
            phone,
            contactId: randomContact?.id,
            contact: randomContact,
          },
        });

        // Автоматически завершаем через 30 секунд
        setTimeout(() => {
          const duration = Math.floor(Math.random() * 300) + 60;
          get().updateCall(newCall.id, {
            status: 'completed',
            duration,
            endedAt: new Date().toISOString(),
            recordingStatus: 'downloaded',
          });
          get().setActiveCall(null);
          setTimeout(() => get().simulateAnalysisComplete(newCall.id), 4000);
        }, 30000);
      },

      /**
       * Симулирует завершение ИИ-анализа звонка
       */
      simulateAnalysisComplete: (callId) => {
        const sentiments: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative'];
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        const score = Math.floor(Math.random() * 60) + 30;

        const mockAnalysis = {
          id: generateId(),
          callId,
          transcription: [
            { speaker: 'operator' as const, text: 'Здравствуйте, как могу помочь?', startTime: 0, endTime: 4 },
            { speaker: 'client' as const, text: 'Да, хотел узнать подробнее о вашем продукте.', startTime: 5, endTime: 10 },
          ],
          summary: 'Клиент интересовался продуктом. Получена базовая информация.',
          sentiment,
          score,
          objections: score < 50 ? ['Высокая цена', 'Нужно время подумать'] : [],
          checklistPassed: ['Приветствие', 'Выявление потребности'],
          checklistFailed: score < 50 ? ['Закрытие сделки'] : [],
          entities: { nextAction: 'Отправить коммерческое предложение' },
          modelUsed: 'YandexGPT (Mock)',
          processedAt: new Date().toISOString(),
        };

        get().updateCall(callId, {
          analysisStatus: 'completed',
          analysis: mockAnalysis,
          recordingStatus: 'processed',
        });

        get().addNotification({
          type: 'analysis_complete',
          title: '🤖 ИИ-анализ готов',
          message: `Оценка звонка: ${score}% • Настроение: ${
            sentiment === 'positive' ? 'Позитивное' :
            sentiment === 'neutral' ? 'Нейтральное' : 'Негативное'
          }`,
        });
      },

      // ============================
      // UI State
      // ============================
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'crm-pro-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        contacts: state.contacts,
        calls: state.calls,
        activities: state.activities,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
