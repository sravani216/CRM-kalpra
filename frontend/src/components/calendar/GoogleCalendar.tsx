import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Tag,
  AlertCircle,
  Bell,
  Sparkles,
  X,
  Filter
} from 'lucide-react';

interface Reminder {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'MEETING' | 'TASK' | 'FOLLOWUP' | 'DEADLINE' | 'PERSONAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notes?: string;
  isCompleted: boolean;
  createdAt?: string;
}

interface GoogleCalendarProps {
  userId?: string;
  readOnly?: boolean;
  title?: string;
}

export const GoogleCalendar: React.FC<GoogleCalendarProps> = ({
  userId,
  readOnly = false,
  title = 'Interactive Calendar & Task Reminders'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Add Reminder Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    category: 'TASK' as 'MEETING' | 'TASK' | 'FOLLOWUP' | 'DEADLINE' | 'PERSONAL',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    notes: '',
  });

  useEffect(() => {
    fetchReminders();
  }, [userId]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reminders', userId ? { userId } : undefined);
      if (res.success && res.data) {
        setReminders(res.data);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleOpenAddModal = (dateStr?: string) => {
    if (readOnly) return;
    setForm({
      title: '',
      date: dateStr || selectedDate || new Date().toISOString().split('T')[0],
      time: '11:00',
      category: 'TASK',
      priority: 'MEDIUM',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const res = await api.post('/reminders', {
        ...form,
        userId,
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchReminders();
      }
    } catch (err) {
      alert('Failed to save reminder');
    }
  };

  const handleToggleReminder = async (id: string, e?: React.MouseEvent) => {
    if (readOnly) return;
    if (e) e.stopPropagation();
    try {
      await api.patch(`/reminders/${id}/toggle`);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
      );
      if (selectedReminder?.id === id) {
        setSelectedReminder((prev) => (prev ? { ...prev, isCompleted: !prev.isCompleted } : null));
      }
    } catch (err) {}
  };

  const handleDeleteReminder = async (id: string, e?: React.MouseEvent) => {
    if (readOnly) return;
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this task reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      if (selectedReminder?.id === id) setSelectedReminder(null);
    } catch (err) {}
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarDays.push({ day, isCurrentMonth: false, dateStr });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = curDate.toISOString().split('T')[0];
    calendarDays.push({ day: d, isCurrentMonth: true, dateStr });
  }
  // Next month padding
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = nextDate.toISOString().split('T')[0];
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const getCategoryColor = (cat: Reminder['category']) => {
    switch (cat) {
      case 'MEETING':
        return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
      case 'TASK':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      case 'FOLLOWUP':
        return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200';
      case 'DEADLINE':
        return 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200';
      case 'PERSONAL':
        return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  };

  const getPriorityBadge = (p: Reminder['priority']) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-500 text-white';
      case 'HIGH':
        return 'bg-amber-500 text-white';
      case 'MEDIUM':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const selectedDayReminders = reminders.filter((r) => r.date === selectedDate);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any calendar day to schedule tasks, set client reminders, and monitor deadlines.
            </p>
          </div>
        </div>

        {/* View mode toggle & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month' ? 'bg-white text-brand-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-white text-brand-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            Today
          </button>

          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!readOnly && (
            <button
              onClick={() => handleOpenAddModal()}
              className="btn-smooth flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-brand-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Calendar Area + Day Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Interactive Calendar Grid */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {reminders.filter((r) => !r.isCompleted).length} pending reminders
            </span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((item, idx) => {
              const isToday = item.dateStr === todayStr;
              const isSelected = item.dateStr === selectedDate;
              const dayReminders = reminders.filter((r) => r.date === item.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDate(item.dateStr);
                  }}
                  onDoubleClick={() => handleOpenAddModal(item.dateStr)}
                  className={`min-h-[92px] p-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-2 ring-brand-500/20'
                      : item.isCurrentMonth
                      ? 'border-slate-100 bg-white hover:border-brand-200 hover:bg-slate-50/60'
                      : 'border-slate-50 bg-slate-50/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                          : isSelected
                          ? 'text-brand-700 bg-brand-100'
                          : item.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {item.day}
                    </span>
                    {dayReminders.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    )}
                  </div>

                  {/* Reminder Chips (up to 2 visible, +more indicator) */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayReminders.slice(0, 2).map((rem) => (
                      <div
                        key={rem.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReminder(rem);
                          setSelectedDate(rem.date);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-semibold border transition-all duration-150 ${getCategoryColor(
                          rem.category
                        )} ${rem.isCompleted ? 'line-through opacity-60' : ''}`}
                        title={`${rem.time} - ${rem.title}`}
                      >
                        <span className="font-bold mr-1">{rem.time}</span>
                        {rem.title}
                      </div>
                    ))}
                    {dayReminders.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 block px-1">
                        +{dayReminders.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Meetings
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tasks
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Follow-ups
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Deadlines
              </span>
            </div>
            <span>Double click day to add task</span>
          </div>
        </div>

        {/* Right: Selected Day's Schedule & Reminders Drawer */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Selected Date
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h4>
              </div>
              {!readOnly && (
                <button
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="btn-smooth p-2 rounded-xl bg-white border border-slate-200 text-brand-600 hover:border-brand-300 shadow-sm transition-all"
                  title="Add to this date"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reminders List for Selected Day */}
            <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {selectedDayReminders.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No task reminders scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Keep your day structured by adding client check-ins or meetings.
                  </p>
                  {!readOnly && (
                    <button
                      onClick={() => handleOpenAddModal(selectedDate)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-bold transition-colors"
                    >
                      + Add for this day
                    </button>
                  )}
                </div>
              ) : (
                selectedDayReminders.map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => setSelectedReminder(rem)}
                    className={`p-3.5 rounded-2xl border bg-white transition-all duration-200 hover:shadow-sm cursor-pointer ${
                      rem.isCompleted ? 'border-slate-100 bg-slate-50/50 opacity-70' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={(e) => handleToggleReminder(rem.id, e)}
                          disabled={readOnly}
                          className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {rem.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <h5
                            className={`text-xs font-bold leading-tight ${
                              rem.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {rem.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {rem.time}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${getPriorityBadge(
                                rem.priority
                              )}`}
                            >
                              {rem.priority}
                            </span>
                          </div>
                          {rem.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic bg-slate-50 p-1.5 rounded-lg">
                              "{rem.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {!readOnly && (
                        <button
                          onClick={(e) => handleDeleteReminder(rem.id, e)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Kalpra Calendar Engine</span>
            <span className="font-semibold text-emerald-600">● Live Sync</span>
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Task Reminder</h3>
                  <p className="text-xs text-slate-400">Google Calendar-style notification</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call Vikram Malhotra regarding telemetry SLA"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  >
                    <option value="TASK">Task (Work)</option>
                    <option value="MEETING">Client Meeting</option>
                    <option value="FOLLOWUP">Follow-up Call</option>
                    <option value="DEADLINE">Proposal Deadline</option>
                    <option value="PERSONAL">Personal Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent ⚡</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes & Key Points (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context, client instructions or questions to ask..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-smooth px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

