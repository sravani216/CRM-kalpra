import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Building2,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  assignedToId: string;
  clientId?: string;
  leadId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'OVERDUE';
  dueDate: string;
}

interface TodayTasksCardProps {
  userId?: string;
  readOnly?: boolean;
}

export const TodayTasksCard: React.FC<TodayTasksCardProps> = ({
  userId,
  readOnly = false,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', userId ? { assignedToId: userId } : undefined);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (readOnly) return;
    const newStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {}
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const res = await api.post('/tasks', {
        ...form,
        assignedToId: userId,
      });
      if (res.success) {
        setIsModalOpen(false);
        setForm({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: new Date().toISOString().split('T')[0],
        });
        fetchTasks();
      }
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  // Filter for today's tasks or pending urgent tasks
  const todayTasks = tasks.filter(
    (t) => t.dueDate.startsWith(todayStr) || t.status !== 'COMPLETED'
  );

  const completedCount = todayTasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = todayTasks.length ? Math.round((completedCount / todayTasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Today's Tasks & Works</h3>
              <p className="text-xs text-slate-400">
                {completedCount} of {todayTasks.length} tasks completed today
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-emerald flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-500">Daily Execution Target</span>
            <span className="text-emerald-600">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="mt-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">All caught up for today!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No overdue works remaining.</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleComplete(task)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3 ${
                  task.status === 'COMPLETED'
                    ? 'bg-slate-50/60 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    disabled={readOnly}
                    className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors shrink-0"
                  >
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h5
                      className={`text-xs font-bold leading-tight ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </h5>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          task.priority === 'HIGH' || task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due Today
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
        <span>Task Queue Verified</span>
        <span className="text-slate-600 font-bold">{tasks.length} total assignments</span>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Add Today's Work Item</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call Apex Logistics fleet manager for signoff"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details</label>
                <textarea
                  rows={2}
                  placeholder="What needs to be achieved in this work item..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent ⚡</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
