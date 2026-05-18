import { useState, useMemo } from 'react';
import {
  Plus, Search, Phone, Mail, Building, Tag,
  Edit, Trash2, Eye, Download, Upload, PhoneOutgoing,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Textarea } from '../components/ui/Input';
import { getInitials, formatDate, getScoreBg } from '../utils/formatters';
import type { Contact } from '../types';

const TAG_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default'> = {
  'VIP': 'purple',
  'Горячий лид': 'danger',
  'Тёплый лид': 'warning',
  'Холодный лид': 'info',
  'Постоянный клиент': 'success',
  'Новый лид': 'default',
  'B2B': 'info',
  'B2C': 'default',
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  phoneType: 'mobile' | 'work' | 'home' | 'other';
  tags: string;
  source: string;
  notes: string;
  score: number;
}

const EMPTY_FORM: ContactFormData = {
  firstName: '',
  lastName: '',
  company: '',
  position: '',
  email: '',
  phone: '',
  phoneType: 'mobile',
  tags: '',
  source: '',
  notes: '',
  score: 50,
};

export function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact, makeCall, currentUser } = useStore();

  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      const matchSearch =
        !q ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.phones.some((p) => p.number.includes(q)) ||
        c.emails.some((e) => e.toLowerCase().includes(q));
      const matchTag = !filterTag || c.tags.includes(filterTag);
      return matchSearch && matchTag;
    });
  }, [contacts, search, filterTag]);

  const openCreate = () => {
    setEditingContact(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company ?? '',
      position: c.position ?? '',
      email: c.emails[0] ?? '',
      phone: c.phones[0]?.number ?? '',
      phoneType: c.phones[0]?.type ?? 'mobile',
      tags: c.tags.join(', '),
      source: c.source ?? '',
      notes: c.notes ?? '',
      score: c.score,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.phone.trim()) return;

    const data = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      company: form.company.trim() || undefined,
      position: form.position.trim() || undefined,
      emails: form.email ? [form.email.trim()] : [],
      phones: form.phone ? [{ number: form.phone.trim(), type: form.phoneType, isPrimary: true }] : [],
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      source: form.source.trim() || undefined,
      notes: form.notes.trim() || undefined,
      score: form.score,
      createdBy: currentUser?.id ?? 'u1',
    };

    if (editingContact) {
      updateContact(editingContact.id, data);
    } else {
      addContact(data);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteContact(id);
    setDeleteConfirm(null);
  };

  const handleCall = (c: Contact) => {
    const phone = c.phones.find((p) => p.isPrimary)?.number ?? c.phones[0]?.number;
    if (phone) makeCall(phone, c.id);
  };

  const sourceOptions = [
    { value: '', label: 'Не указан' },
    { value: 'Входящий звонок', label: 'Входящий звонок' },
    { value: 'Выставка', label: 'Выставка' },
    { value: 'Реклама ВКонтакте', label: 'Реклама ВКонтакте' },
    { value: 'SEO / Органика', label: 'SEO / Органика' },
    { value: 'Рекомендация', label: 'Рекомендация' },
    { value: 'Партнёры', label: 'Партнёры' },
    { value: 'Другое', label: 'Другое' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Контакты</h2>
          <p className="text-sm text-slate-500 mt-0.5">{contacts.length} клиентов в базе</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>
            Импорт
          </Button>
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>
            Экспорт
          </Button>
          <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Добавить контакт
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону, компании..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterTag('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterTag ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Все
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterTag === tag ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-auto">Показано: {filtered.length}</span>
      </div>

      {/* Contacts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-md transition-all duration-200 relative group"
          >
            {/* Score indicator */}
            <div className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full border ${getScoreBg(contact.score)}`}>
              {contact.score}%
            </div>

            {/* Avatar + Name */}
            <div className="flex items-start gap-3 mb-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getInitials(`${contact.firstName} ${contact.lastName}`)}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-semibold text-slate-900 text-sm truncate">
                  {contact.firstName} {contact.lastName}
                </h3>
                {contact.company && (
                  <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <Building className="h-3 w-3 flex-shrink-0" />
                    {contact.company}
                    {contact.position && ` • ${contact.position}`}
                  </p>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-1.5 mb-3">
              {contact.phones.slice(0, 1).map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span>{p.number}</span>
                </div>
              ))}
              {contact.emails.slice(0, 1).map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{e}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {contact.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant={TAG_COLORS[tag] ?? 'default'} size="sm">
                    {tag}
                  </Badge>
                ))}
                {contact.tags.length > 3 && (
                  <span className="text-xs text-slate-400">+{contact.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Source + Date */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pt-2 border-t border-slate-100">
              <span>{contact.source ?? '—'}</span>
              <span>{formatDate(contact.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCall(contact)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
              >
                <PhoneOutgoing className="h-3.5 w-3.5" />
                Позвонить
              </button>
              <button
                onClick={() => setViewContact(contact)}
                className="flex items-center justify-center p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => openEdit(contact)}
                className="flex items-center justify-center p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirm(contact.id)}
                className="flex items-center justify-center p-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Контакты не найдены</p>
            <p className="text-sm text-slate-400 mt-1">Попробуйте изменить параметры поиска или добавьте новый контакт</p>
            <Button className="mt-4" size="sm" onClick={openCreate} icon={<Plus className="h-4 w-4" />}>
              Добавить контакт
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingContact ? 'Редактировать контакт' : 'Новый контакт'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!form.firstName || !form.phone}>
              {editingContact ? 'Сохранить' : 'Создать контакт'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Имя *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Иван"
            />
            <Input
              label="Фамилия"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Иванов"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Компания"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="ООО Компания"
              icon={<Building className="h-4 w-4" />}
            />
            <Input
              label="Должность"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="Директор"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Телефон *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+7 (999) 000-00-00"
              icon={<Phone className="h-4 w-4" />}
            />
            <Select
              label="Тип телефона"
              value={form.phoneType}
              onChange={(e) => setForm({ ...form, phoneType: e.target.value as ContactFormData['phoneType'] })}
              options={[
                { value: 'mobile', label: 'Мобильный' },
                { value: 'work', label: 'Рабочий' },
                { value: 'home', label: 'Домашний' },
                { value: 'other', label: 'Другой' },
              ]}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="client@company.ru"
            icon={<Mail className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Теги (через запятую)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="VIP, Горячий лид"
              icon={<Tag className="h-4 w-4" />}
            />
            <Select
              label="Источник"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              options={sourceOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Оценка лида: {form.score}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Холодный</span>
              <span>Тёплый</span>
              <span>Горячий</span>
            </div>
          </div>
          <Textarea
            label="Заметки"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Дополнительная информация о контакте..."
            rows={3}
          />
        </div>
      </Modal>

      {/* View Contact Modal */}
      {viewContact && (
        <Modal
          isOpen={!!viewContact}
          onClose={() => setViewContact(null)}
          title={`${viewContact.firstName} ${viewContact.lastName}`}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setViewContact(null)}>Закрыть</Button>
              <Button variant="success" icon={<PhoneOutgoing className="h-4 w-4" />} onClick={() => { handleCall(viewContact); setViewContact(null); }}>
                Позвонить
              </Button>
              <Button icon={<Edit className="h-4 w-4" />} onClick={() => { openEdit(viewContact); setViewContact(null); }}>
                Редактировать
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {getInitials(`${viewContact.firstName} ${viewContact.lastName}`)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewContact.firstName} {viewContact.lastName}</h3>
                {viewContact.company && (
                  <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                    <Building className="h-4 w-4" />
                    {viewContact.company}{viewContact.position && ` • ${viewContact.position}`}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-sm font-semibold px-2.5 py-1 rounded-full border ${getScoreBg(viewContact.score)}`}>
                    Оценка: {viewContact.score}%
                  </span>
                  {viewContact.tags.map((tag) => (
                    <Badge key={tag} variant={TAG_COLORS[tag] ?? 'default'} size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Телефоны</p>
                {viewContact.phones.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {p.number} <span className="text-xs text-slate-400">({p.type})</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</p>
                {viewContact.emails.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {e}
                  </div>
                ))}
              </div>
            </div>

            {viewContact.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Заметки</p>
                <p className="text-sm text-slate-700">{viewContact.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Источник: </span>
                <span className="text-slate-700">{viewContact.source ?? '—'}</span>
              </div>
              <div>
                <span className="text-slate-400">Добавлен: </span>
                <span className="text-slate-700">{formatDate(viewContact.createdAt)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Удалить контакт?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Удалить</Button>
          </>
        }
      >
        <p className="text-slate-600">Это действие нельзя отменить. Все данные контакта, включая историю звонков и активностей, будут сохранены.</p>
      </Modal>
    </div>
  );
}

// Fix missing import
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
