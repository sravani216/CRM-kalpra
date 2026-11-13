import React, { useState, useEffect } from 'react';
import { CalendarView } from '../../../components/calendar/CalendarView';
import { Badge } from '../../../components/common/Badge';
import { api } from '../../../api/client';
import { TaskSchedule, PersonalNote, ExecutiveAnalytics } from '../../../types';
import {
  IndianRupee,
  Calendar as CalendarIcon,
  Clock,
  StickyNote,
  Users2,
  TrendingUp,
  ArrowRight,
  Plus,
  Trash2,
  Pin,
} from 'lucide-react';

interface HeadHomeTabProps {
  onNavigateTab: (tabId: string) => void;
}

export const HeadHomeTab: React.FC<HeadHomeTabProps> = ({ onNavigateTab }) => {
  const [tasks, setTasks] = useState<TaskSchedule[]>([]);
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [analytics, setAnalytics] = useState<ExecutiveAnalytics | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Notes state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchNotes();
    fetchAnalytics();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get<{ success: boolean; tasks: TaskSchedule[] }>('/tasks');
      setTasks(res.tasks || []);
    } catch (err) {}
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get<{ success: boolean; notes: PersonalNote[] }>('/notes');
      setNotes(res.notes || []);
    } catch (err) {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get<{ success: boolean } & ExecutiveAnalytics>('/analytics/executive');
      setAnalytics(res);
    } catch (err) {}
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      const res = await api.post<{ success: boolean; note: PersonalNote }>('/notes', {
        title: newNoteTitle.trim() || undefined,
        content: newNoteContent.trim(),
        color: 'purple',
      });
      if (res.note) {
        setNotes((prev) => [res.note, ...prev]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsAddingNote(false);
      }
    } catch (err) {}
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {}
  };

  const filteredTasks = tasks.filter((t) => {
    const td = new Date(t.scheduledDate);
    return (
      td.getDate() === selectedDate.getDate() &&
      td.getMonth() === selectedDate.getMonth() &&
      td.getFullYear() === selectedDate.getFullYear()
    );
  });

  const totalWonRevenue = analytics?.overview?.totalRevenue || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Row: Quick Revenue summary badge + Wide Calendar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Revenue Badge */}
        <div className="lg:col-span-1 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-100">
                Total Closed Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              ₹{Number(totalWonRevenue).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-pink-100 mt-2">
              From {analytics?.overview?.totalClients || 0} converted enterprise clients
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 mt-4">
            <button
              onClick={() => onNavigateTab('deals')}
              className="w-full py-2 bg-white text-pink-700 hover:bg-pink-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-xs"
            >
              <span>Manage Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Wide Calendar Overview of Team Schedules */}
        <div className="lg:col-span-3">
          <CalendarView
            tasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            title="Department Calendar & Meeting Allocations"
          />
        </div>
      </div>

      {/* Bottom Row: Three Split Cards (Revenue Summary, Team Tasks, Notes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Revenue / Performance Summary */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-pink-50 mb-3">
              <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Pipeline Performance</h3>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Leads in Funnel:</span>
                <span className="font-bold text-slate-800">{analytics?.overview?.totalLeads || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overall Win Rate:</span>
                <span className="font-bold text-emerald-600">
                  {analytics?.overview?.overallConversionRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Completed Meetings:</span>
                <span className="font-bold text-slate-800">{analytics?.overview?.totalMeetings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Progress:</span>
                <span className="font-bold text-pink-600">
                  {analytics?.overview?.targetProgressPercentage || 0}% of ₹30L Target
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('team')}
            className="w-full mt-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
          >
            <span>Review Team Allocation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Team Tasks for Selected Day */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-pink-50 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Team Tasks ({filteredTasks.length})
                </h3>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">No team tasks on this date.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl border border-pink-100/70 text-xs flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Assigned to: {t.assignedTo?.name || 'Employee'}
                      </div>
                    </div>
                    <Badge status={t.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('schedules')}
            className="w-full mt-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
          >
            <span>Full Schedule Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Notes / Strategy Scratchpad */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-pink-50 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <StickyNote className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Strategy Notes</h3>
              </div>

              {!isAddingNote && (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="p-1 text-pink-600 hover:bg-pink-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {isAddingNote && (
              <form onSubmit={handleCreateNote} className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Note Title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full text-xs font-bold px-2.5 py-1 rounded-lg border border-pink-100 focus:outline-none"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Strategy or reallocation note..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-pink-100 focus:outline-none resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="text-[11px] text-slate-400"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-2.5 py-0.5 bg-pink-500 text-white rounded text-xs font-bold">
                    Save
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {notes.map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-xs relative group">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-purple-950 pr-4">{n.title || 'Untitled'}</span>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-900/80 mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

