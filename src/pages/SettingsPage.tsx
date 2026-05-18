import { useState } from 'react';
import {
  Phone, Bot, Shield, Bell, CheckCircle,
  XCircle, AlertTriangle, ExternalLink, RefreshCw,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { getRoleLabel } from '../utils/formatters';

type Section = 'telephony' | 'ai' | 'notifications' | 'security' | 'profile';

const SECTIONS = [
  { id: 'profile' as Section, label: 'Профиль', icon: Shield },
  { id: 'telephony' as Section, label: 'Телефония', icon: Phone },
  { id: 'ai' as Section, label: 'ИИ-аналитика', icon: Bot },
  { id: 'notifications' as Section, label: 'Уведомления', icon: Bell },
  { id: 'security' as Section, label: 'Безопасность', icon: Shield },
];

interface TelephonyConfig {
  provider: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  callRecording: boolean;
  mockMode: boolean;
}

interface AIConfig {
  provider: string;
  apiKey: string;
  folderId: string;
  autoAnalyze: boolean;
  language: string;
  model: string;
}

export function SettingsPage() {
  const { currentUser } = useStore();
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const [telephony, setTelephony] = useState<TelephonyConfig>({
    provider: 'mcn_telecom',
    apiKey: 'demo-api-key-12345',
    apiSecret: '••••••••••••••••',
    webhookUrl: 'https://your-crm.ru/webhook/phone/mcn',
    callRecording: true,
    mockMode: true,
  });

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'yandex',
    apiKey: 'demo-yandex-key',
    folderId: 'b1g-demo-folder',
    autoAnalyze: true,
    language: 'ru-RU',
    model: 'yandexgpt',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult(telephony.mockMode ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Настройки</h2>
        <p className="text-sm text-slate-500 mt-0.5">Конфигурация системы и интеграций</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {/* Profile */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader title="Профиль пользователя" subtitle="Ваши личные данные и настройки" />
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                    {currentUser?.fullName.split(' ').map((n) => n[0]).join('') ?? 'U'}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{currentUser?.fullName}</p>
                    <p className="text-sm text-slate-500">{currentUser?.email}</p>
                    <Badge variant="purple" size="sm" className="mt-1">{getRoleLabel(currentUser?.role ?? '')}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Имя" defaultValue={currentUser?.fullName?.split(' ')[0]} />
                  <Input label="Фамилия" defaultValue={currentUser?.fullName?.split(' ')[1]} />
                </div>
                <Input label="Email" type="email" defaultValue={currentUser?.email} />
                <Input
                  label="Рабочий телефон"
                  defaultValue={currentUser?.phone ?? ''}
                  placeholder="+7 (495) 000-00-00"
                  hint="Используется для исходящих звонков"
                />
                <div className="flex justify-end">
                  <Button onClick={handleSave} loading={false}>
                    {saved ? '✓ Сохранено' : 'Сохранить профиль'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Telephony */}
          {activeSection === 'telephony' && (
            <>
              <Card>
                <CardHeader
                  title="Провайдер телефонии"
                  subtitle="Интеграция с сервисом IP-телефонии"
                  icon={<Phone className="h-5 w-5" />}
                />
                <div className="space-y-4">
                  {/* Mock mode banner */}
                  {telephony.mockMode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Режим симуляции включён</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Все звонки симулируются без реального подключения к провайдеру.
                          Отключите для использования с реальным MCN Telecom или Телфин.
                        </p>
                      </div>
                    </div>
                  )}

                  <Select
                    label="Провайдер телефонии"
                    value={telephony.provider}
                    onChange={(e) => setTelephony({ ...telephony, provider: e.target.value })}
                    options={[
                      { value: 'mcn_telecom', label: 'MCN Telecom' },
                      { value: 'telfin', label: 'Телфин' },
                      { value: 'beeline', label: 'Билайн Бизнес' },
                      { value: 'mango', label: 'Mango Office' },
                      { value: 'custom', label: 'Кастомный провайдер' },
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="API Key"
                      type="password"
                      value={telephony.apiKey}
                      onChange={(e) => setTelephony({ ...telephony, apiKey: e.target.value })}
                      hint="Получите в личном кабинете провайдера"
                    />
                    <Input
                      label="API Secret"
                      type="password"
                      value={telephony.apiSecret}
                      onChange={(e) => setTelephony({ ...telephony, apiSecret: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Webhook URL"
                    value={telephony.webhookUrl}
                    onChange={(e) => setTelephony({ ...telephony, webhookUrl: e.target.value })}
                    hint="Укажите этот URL в личном кабинете провайдера для получения событий о звонках"
                  />

                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Запись звонков</p>
                      <p className="text-xs text-slate-500">Автоматически записывать все звонки</p>
                    </div>
                    <button
                      onClick={() => setTelephony({ ...telephony, callRecording: !telephony.callRecording })}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${telephony.callRecording ? 'bg-violet-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-1 ${telephony.callRecording ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Режим симуляции (Mock)</p>
                      <p className="text-xs text-slate-500">Использовать мок-данные без реального API</p>
                    </div>
                    <button
                      onClick={() => setTelephony({ ...telephony, mockMode: !telephony.mockMode })}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${telephony.mockMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-1 ${telephony.mockMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Test + Save */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      loading={testing}
                      icon={<RefreshCw className="h-4 w-4" />}
                    >
                      Тест соединения
                    </Button>
                    {testResult === 'success' && (
                      <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                        <CheckCircle className="h-4 w-4" /> Соединение установлено
                      </span>
                    )}
                    {testResult === 'error' && (
                      <span className="flex items-center gap-1.5 text-sm text-red-500">
                        <XCircle className="h-4 w-4" /> Ошибка соединения
                      </span>
                    )}
                    <Button onClick={handleSave} className="ml-auto">
                      {saved ? '✓ Сохранено' : 'Сохранить'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Webhook info */}
              <Card>
                <CardHeader title="Настройка Webhook" subtitle="Как зарегистрировать webhook в личном кабинете провайдера" />
                <div className="space-y-4">
                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm">
                    <p className="text-slate-400 text-xs mb-2"># Webhook endpoints:</p>
                    {[
                      ['POST', '/webhook/phone/mcn', 'Все события звонков'],
                      ['POST', '/webhook/phone/mcn/recording', 'Запись готова'],
                    ].map(([method, path, desc]) => (
                      <div key={path} className="flex gap-3 mb-1">
                        <span className="text-emerald-400">{method}</span>
                        <span className="text-violet-300">{telephony.webhookUrl.replace('/webhook/phone/mcn', '')}{path}</span>
                        <span className="text-slate-500"># {desc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="https://mcntelecom.ru/api" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Документация MCN Telecom API
                    </a>
                    <span className="text-slate-300">|</span>
                    <a href="https://telphin.ru/api" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Документация Телфин API
                    </a>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* AI Settings */}
          {activeSection === 'ai' && (
            <Card>
              <CardHeader
                title="ИИ-аналитика звонков"
                subtitle="Настройки транскрибации и анализа"
                icon={<Bot className="h-5 w-5" />}
              />
              <div className="space-y-4">
                <Select
                  label="ИИ-провайдер"
                  value={aiConfig.provider}
                  onChange={(e) => setAIConfig({ ...aiConfig, provider: e.target.value })}
                  options={[
                    { value: 'yandex', label: 'Yandex SpeechKit + YandexGPT' },
                    { value: 'openai', label: 'OpenAI Whisper + GPT-4' },
                    { value: 'ollama', label: 'Локальная модель (Ollama + Llama 3)' },
                    { value: 'mock', label: 'Мок-режим (без реального ИИ)' },
                  ]}
                />

                {aiConfig.provider === 'yandex' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Yandex API Key"
                        type="password"
                        value={aiConfig.apiKey}
                        onChange={(e) => setAIConfig({ ...aiConfig, apiKey: e.target.value })}
                        hint="IAM-токен или API-ключ сервисного аккаунта"
                      />
                      <Input
                        label="Folder ID"
                        value={aiConfig.folderId}
                        onChange={(e) => setAIConfig({ ...aiConfig, folderId: e.target.value })}
                        hint="ID каталога в Yandex Cloud"
                      />
                    </div>
                    <Select
                      label="Модель"
                      value={aiConfig.model}
                      onChange={(e) => setAIConfig({ ...aiConfig, model: e.target.value })}
                      options={[
                        { value: 'yandexgpt', label: 'YandexGPT (latest)' },
                        { value: 'yandexgpt-lite', label: 'YandexGPT Lite (быстрее)' },
                        { value: 'llama', label: 'LLaMA 3 (через Ollama)' },
                      ]}
                    />
                  </>
                )}

                <Select
                  label="Язык распознавания"
                  value={aiConfig.language}
                  onChange={(e) => setAIConfig({ ...aiConfig, language: e.target.value })}
                  options={[
                    { value: 'ru-RU', label: 'Русский' },
                    { value: 'en-US', label: 'English' },
                    { value: 'kk-KZ', label: 'Казахский' },
                  ]}
                />

                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Автоматический анализ</p>
                    <p className="text-xs text-slate-500">Запускать ИИ-анализ сразу после завершения звонка</p>
                  </div>
                  <button
                    onClick={() => setAIConfig({ ...aiConfig, autoAnalyze: !aiConfig.autoAnalyze })}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${aiConfig.autoAnalyze ? 'bg-violet-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-1 ${aiConfig.autoAnalyze ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Pipeline info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Пайплайн обработки</p>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {['Звонок завершён', '→', 'Загрузка записи', '→', 'Yandex SpeechKit', '→', 'Транскрипт', '→', 'YandexGPT / GPT-4', '→', 'Анализ в CRM'].map((step, i) => (
                      <span key={i} className={step === '→' ? 'text-slate-400' : 'bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700'}>
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>{saved ? '✓ Сохранено' : 'Сохранить'}</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader title="Уведомления" subtitle="Настройка push и email уведомлений" icon={<Bell className="h-5 w-5" />} />
              <div className="space-y-3">
                {[
                  { label: 'Входящий звонок', desc: 'Всплывающее уведомление при новом входящем звонке', enabled: true },
                  { label: 'Завершение звонка', desc: 'Уведомление когда звонок завершён', enabled: true },
                  { label: 'ИИ-анализ готов', desc: 'Когда анализ звонка завершён', enabled: true },
                  { label: 'Пропущенный звонок', desc: 'Уведомление о пропущенных звонках', enabled: true },
                  { label: 'Просроченные задачи', desc: 'Напоминания о задачах с истёкшим сроком', enabled: false },
                  { label: 'Email-отчёт', desc: 'Ежедневный отчёт на email', enabled: false },
                ].map((item) => {
                  const [enabled, setEnabled] = useState(item.enabled);
                  return (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-violet-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-1 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader title="Безопасность" subtitle="Управление доступом и паролями" icon={<Shield className="h-5 w-5" />} />
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Текущий пароль" type="password" placeholder="••••••••" />
                  <Input label="Новый пароль" type="password" placeholder="••••••••" hint="Минимум 8 символов, включая буквы и цифры" />
                  <Input label="Подтвердите пароль" type="password" placeholder="••••••••" />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">🔒 Политика безопасности</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Записи звонков хранятся в зашифрованном виде (AES-256)</li>
                    <li>• Доступ к данным ограничен по ролям (RBAC)</li>
                    <li>• Все API-запросы авторизованы через JWT-токены</li>
                    <li>• Аудит лог всех действий пользователей</li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Обновить пароль</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
