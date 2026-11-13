import React, { useState, useEffect } from 'react';
import { CalendarView } from '../../../components/calendar/CalendarView';
import { Badge } from '../../../components/common/Badge';
import { api } from '../../../api/client';
import { TaskSchedule, PersonalNote } from '../../../types';
import {
  Clock,
  Plus,
  Pin,
  Trash2,
  CheckCircle2,
  StickyNote,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HomeTabProps {
  onJumpToTasks: (taskId?: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onJumpToTasks }) => {
  const [tasks, setTasks] = useState<TaskSchedule[]>([]);
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loadingTasks, setLoadingTasks] = useState(true);

  // New Note State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'purple' | 'green' | 'blue' | 'rose'>('yellow');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchNotes();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get<{ success: boolean; tasks: TaskSchedule[] }>('/tasks');
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get<{ success: boolean; notes: PersonalNote[] }>('/notes');
      setNotes(res.notes || []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    try {
      const res = await api.post<{ success: boolean; note: PersonalNote }>('/notes', {
        title: newNoteTitle.trim() || undefined,
        content: newNoteContent.trim(),
        color: newNoteColor,
      });
      if (res.note) {
        setNotes((prev) => [res.note, ...prev]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsAddingNote(false);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleTogglePin = async (note: PersonalNote) => {
    try {
      const res = await api.patch<{ success: boolean; note: PersonalNote }>(`/notes/${note.id}`, {
        pinned: !note.pinned,
      });
      if (res.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, pinned: res.note.pinned } : n))
        );
      }
    } catch (err) {
      console.error('Failed to pin note:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // Filter tasks for selected date
  const filteredTasks = tasks.filter((t) => {
    const td = new Date(t.scheduledDate);
    return (
      td.getDate() === selectedDate.getDate() &&
      td.getMonth() === selectedDate.getMonth() &&
      td.getFullYear() === selectedDate.getFullYear()
    );
  });

  const getNoteColorClass = (color?: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'green':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'blue':
        return 'bg-sky-50 border-sky-200 text-sky-900';
      case 'rose':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-900';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Wide Card: Calendar Strip */}
      <CalendarView
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        title="Schedule & Meetings Calendar"
      />

      {/* Bottom Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Tasks for Day */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-pink-50 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} scheduled
                  </p>
                </div>
              </div>

              <button
                onClick={() => onJumpToTasks()}
                className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks list */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-400 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600">No tasks on this day</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Enjoy your light schedule or schedule a follow-up.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onJumpToTasks(t.id)}
                    className="p-3.5 rounded-xl border border-pink-100/70 hover:border-pink-300 bg-white hover:bg-pink-50/20 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {t.title}
                        </span>
                        <Badge status={t.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {t.companyName && <span className="font-semibold text-slate-700">{t.companyName} • </span>}
                        {t.personName || t.type.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {t.durationMinutes > 0 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {t.durationMinutes}m logged
                        </span>
                      )}
                      <span className="w-7 h-7 rounded-lg bg-pink-50 group-hover:bg-pink-100 flex items-center justify-center text-pink-600 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notes (Personal Sticky Notes) */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-pink-50 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                  <StickyNote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Personal Notes & Thoughts</h3>
                  <p className="text-[11px] text-slate-400">Daily scratchpad & private reminders</p>
                </div>
              </div>

              {!isAddingNote && (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="px-2.5 py-1 rounded-lg bg-pink-100/70 hover:bg-pink-200 text-pink-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              )}
            </div>

            {/* Add Note Form */}
            {isAddingNote && (
              <form onSubmit={handleCreateNote} className="mb-4 p-3.5 rounded-xl border border-pink-200 bg-pink-50/30 space-y-2.5">
                <input
                  type="text"
                  placeholder="Note Title (Optional)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg border border-pink-100 bg-white focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Quick thought, objection, or workflow reminder..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full text-xs text-slate-700 px-3 py-1.5 rounded-lg border border-pink-100 bg-white focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex space-x-1.5">
                    {(['yellow', 'purple', 'green', 'blue', 'rose'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewNoteColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          c === 'yellow'
                            ? 'bg-amber-200 border-amber-300'
                            : c === 'purple'
                            ? 'bg-purple-200 border-purple-300'
                            : c === 'green'
                            ? 'bg-emerald-200 border-emerald-300'
                            : c === 'blue'
                            ? 'bg-sky-200 border-sky-300'
                            : 'bg-rose-200 border-rose-300'
                        } ${newNoteColor === c ? 'scale-125 ring-2 ring-slate-700' : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sticky Notes Grid */}
            {notes.length === 0 && !isAddingNote ? (
              <div className="text-center py-10">
                <p className="text-xs font-semibold text-slate-500">No notes yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Capture daily thoughts, client nuances, or quick reminders.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-xl border relative transition-all ${getNoteColorClass(
                      note.color
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold leading-tight pr-12">
                        {note.title || 'Untitled Thought'}
                      </h4>
                      <div className="flex items-center space-x-1 absolute top-2.5 right-2.5">
                        <button
                          onClick={() => handleTogglePin(note)}
                          className={`p-1 rounded-md transition-colors ${
                            note.pinned ? 'text-pink-600 bg-pink-100' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={note.pinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs mt-1.5 whitespace-pre-wrap leading-relaxed opacity-90">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

