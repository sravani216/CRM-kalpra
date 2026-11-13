import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../api/client';
import { TaskSchedule, TaskType, TaskStatus, Lead } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  Clock,
  Play,
  Square,
  Upload,
  Calendar as CalendarIcon,
  CheckCircle2,
  FileText,
  Camera,
  History,
  Plus,
  Building2,
  User as UserIcon,
  Phone,
  ExternalLink,
} from 'lucide-react';

interface TasksScheduleTabProps {
  initialTaskId?: string | null;
}

export const TasksScheduleTab: React.FC<TasksScheduleTabProps> = ({ initialTaskId }) => {
  const [tasks, setTasks] = useState<TaskSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TaskType | 'ALL'>('CLIENT_MEETING');
  const [showHistory, setShowHistory] = useState(false);

  // Active meeting / task timer
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialTaskId || null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerIntervalRef = useRef<any>(null);

  // File Upload State for proof & report
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState(false);
  const [taskToUpload, setTaskToUpload] = useState<TaskSchedule | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportSummary, setReportSummary] = useState('');
  const [uploading, setUploading] = useState(false);

  // New Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    type: 'CLIENT_MEETING' as TaskType,
    companyName: '',
    personName: '',
    personDesignation: '',
    contact: '',
    scheduledDate: new Date().toISOString().slice(0, 16),
    leadId: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchLeads();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get<{ success: boolean; tasks: TaskSchedule[] }>('/tasks');
      setTasks(res.tasks || []);
      // If there's an in-progress task, set it active
      const inProgress = (res.tasks || []).find((t) => t.status === 'IN_PROGRESS');
      if (inProgress) {
        setActiveTaskId(inProgress.id);
        setTimerRunning(true);
        if (inProgress.startTime) {
          const diff = Math.floor((Date.now() - new Date(inProgress.startTime).getTime()) / 1000);
          setSecondsElapsed(Math.max(0, diff));
        }
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get<{ success: boolean; leads: Lead[] }>('/leads');
      setLeads(res.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  };

  // Live timer interval
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const handleStartTimer = async (task: TaskSchedule) => {
    try {
      const res = await api.patch<{ success: boolean; task: TaskSchedule }>(`/tasks/${task.id}/start`);
      if (res.task) {
        setActiveTaskId(task.id);
        setTimerRunning(true);
        setSecondsElapsed(0);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? res.task : t)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start timer.');
    }
  };

  const handleStopTimer = async (task: TaskSchedule) => {
    try {
      const res = await api.patch<{ success: boolean; task: TaskSchedule; durationMinutes: number }>(
        `/tasks/${task.id}/stop`,
        { status: 'IN_PROGRESS' } // Keep or update status
      );
      if (res.task) {
        setTimerRunning(false);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? res.task : t)));
        // Prompt for meeting proof upload
        setTaskToUpload(res.task);
        setUploadProofModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to stop timer.');
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToUpload) return;

    setUploading(true);
    const formData = new FormData();
    if (photoFile) formData.append('photo', photoFile);
    if (reportFile) formData.append('report', reportFile);
    if (reportSummary.trim()) formData.append('reportSummary', reportSummary.trim());

    try {
      const res = await api.upload<{ success: boolean; task: TaskSchedule }>(
        `/tasks/${taskToUpload.id}/upload`,
        formData
      );
      if (res.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskToUpload.id ? res.task : t)));
        setUploadProofModalOpen(false);
        setPhotoFile(null);
        setReportFile(null);
        setReportSummary('');
        setTaskToUpload(null);
        alert('Meeting proof and report submitted successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload proof.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<{ success: boolean; task: TaskSchedule }>('/tasks', {
        ...newTaskData,
        leadId: newTaskData.leadId || undefined,
      });
      if (res.task) {
        setTasks((prev) => [res.task, ...prev]);
        setIsAddModalOpen(false);
        setNewTaskData({
          title: '',
          type: 'CLIENT_MEETING',
          companyName: '',
          personName: '',
          personDesignation: '',
          contact: '',
          scheduledDate: new Date().toISOString().slice(0, 16),
          leadId: '',
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to schedule task.');
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter tasks based on category & history toggle
  const displayedTasks = tasks.filter((t) => {
    if (showHistory) {
      return t.status === 'COMPLETED' || t.status === 'MISSED';
    }
    const matchesCategory = activeCategory === 'ALL' || t.type === activeCategory;
    const isPending = t.status === 'PENDING' || t.status === 'IN_PROGRESS';
    return matchesCategory && isPending;
  });

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top 3 Category Cards + History Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto">
          {[
            { id: 'CLIENT_MEETING', label: 'Client Meeting' },
            { id: 'FOLLOW_UP', label: 'Follow-ups' },
            { id: 'REPORT', label: 'Report' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setShowHistory(false);
                setActiveCategory(cat.id as TaskType);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !showHistory && activeCategory === cat.id
                  ? 'bg-pink-500 text-white shadow-xs shadow-pink-200'
                  : 'bg-white text-slate-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              showHistory
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History / Proofs</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Active Task / Meeting Card (Exact Wireframe Match) */}
      {activeTask && (
        <div className="bg-gradient-to-br from-white to-pink-50/40 rounded-2xl border-2 border-pink-300 p-6 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-pink-500 text-white text-[10px] uppercase font-extrabold tracking-wider rounded-bl-xl">
            Active Meeting Session
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">{activeTask.title}</h3>
                <p className="text-xs text-pink-600 font-semibold">{activeTask.type.replace('_', ' ')}</p>
              </div>

              {/* Exact Wireframe Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Company Name</span>
                  <span className="font-bold text-slate-700">{activeTask.companyName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Person Name</span>
                  <span className="font-bold text-slate-700">{activeTask.personName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
                  <span className="font-bold text-slate-700">{activeTask.personDesignation || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-bold text-slate-700">{activeTask.contact || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Live Timer & Action Controls */}
            <div className="flex flex-col items-center sm:items-end justify-center space-y-3 shrink-0">
              <div className="flex items-center space-x-2.5 bg-white px-4 py-2 rounded-xl border border-pink-200 shadow-xs">
                <Clock className={`w-5 h-5 ${timerRunning ? 'text-pink-500 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-mono text-xl font-extrabold text-slate-800">
                  {formatTimer(secondsElapsed)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!timerRunning ? (
                  <button
                    onClick={() => handleStartTimer(activeTask)}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Timer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStopTimer(activeTask)}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Timer</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setTaskToUpload(activeTask);
                    setUploadProofModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-slate-700 text-xs font-bold border border-pink-200 flex items-center space-x-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-pink-500" />
                  <span>Upload Proof</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List / History View */}
      <div className="bg-white rounded-2xl border border-pink-100/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-pink-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            {showHistory ? 'Completed Meeting Logs & Uploaded Proofs' : `${activeCategory.replace('_', ' ')} Pipeline`}
          </h3>
          <span className="text-xs text-slate-400">
            {displayedTasks.length} {displayedTasks.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {displayedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs font-semibold text-slate-500">No scheduled tasks in this view</p>
            <p className="text-[11px] text-slate-400 mt-1">Schedule a new client meeting or check history.</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-50/70">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-pink-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800 truncate">{task.title}</span>
                    <Badge status={task.status} size="sm" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(task.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center space-x-2">
                    {task.companyName && <span className="font-semibold text-slate-700">{task.companyName}</span>}
                    {task.personName && <span>• {task.personName} ({task.personDesignation || 'Contact'})</span>}
                    {task.contact && <span>• {task.contact}</span>}
                  </div>

                  {task.reportSummary && (
                    <p className="text-xs text-slate-600 bg-pink-50/40 p-2 rounded-lg border border-pink-100/60 mt-2">
                      📝 {task.reportSummary}
                    </p>
                  )}

                  {/* Attached Proofs Thumbnails */}
                  {(task.photoUrl || task.reportUrl) && (
                    <div className="flex items-center space-x-3 pt-1">
                      {task.photoUrl && (
                        <a
                          href={task.photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200"
                        >
                          <Camera className="w-3 h-3" />
                          <span>View Meeting Photo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {task.reportUrl && (
                        <a
                          href={task.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Download Report</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {task.durationMinutes > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      {task.durationMinutes} min
                    </span>
                  )}

                  {task.status !== 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => {
                          setActiveTaskId(task.id);
                          handleStartTimer(task);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </button>

                      <button
                        onClick={() => {
                          setTaskToUpload(task);
                          setUploadProofModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-pink-200 text-pink-700 hover:bg-pink-50 text-xs font-bold"
                        title="Upload Photo / Report"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Proof & Report Modal */}
      <Modal
        isOpen={uploadProofModalOpen}
        onClose={() => setUploadProofModalOpen(false)}
        title="Upload Meeting Proof & Report"
        subtitle={taskToUpload?.title}
      >
        <form onSubmit={handleUploadProof} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Meeting Proof Photo (JPG, PNG)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Report Document (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setReportFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Daily Work / Meeting Summary
            </label>
            <textarea
              rows={3}
              placeholder="Summary of discussions, client agreements, and next steps..."
              value={reportSummary}
              onChange={(e) => setReportSummary(e.target.value)}
              className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none font-medium"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-pink-50">
            <button
              type="button"
              onClick={() => setUploadProofModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs"
            >
              {uploading ? 'Uploading...' : 'Submit & Complete'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Task / Meeting"
        subtitle="Plan field visits, calls, or daily reports"
      >
        <form onSubmit={handleCreateTask} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Discovery Meeting with CTO"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Task Category</label>
              <select
                value={newTaskData.type}
                onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value as TaskType })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              >
                <option value="CLIENT_MEETING">Client Meeting</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="REPORT">Report</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={newTaskData.scheduledDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Link to Lead (Optional)</label>
            <select
              value={newTaskData.leadId}
              onChange={(e) => {
                const lid = e.target.value;
                const lead = leads.find((l) => l.id === lid);
                setNewTaskData({
                  ...newTaskData,
                  leadId: lid,
                  companyName: lead?.companyName || newTaskData.companyName,
                  personName: lead?.name || newTaskData.personName,
                  personDesignation: lead?.designation || newTaskData.personDesignation,
                  contact: lead?.contact || newTaskData.contact,
                });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            >
              <option value="">-- No linked lead --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.companyName || l.area})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Company"
                value={newTaskData.companyName}
                onChange={(e) => setNewTaskData({ ...newTaskData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Person Name</label>
              <input
                type="text"
                placeholder="Person"
                value={newTaskData.personName}
                onChange={(e) => setNewTaskData({ ...newTaskData, personName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-pink-50">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

