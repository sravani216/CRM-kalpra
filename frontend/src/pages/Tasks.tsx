import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertCircle,
  Send,
  Upload,
  ArrowRight
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    clientId: '',
    leadId: '',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
  });

  const [submitForm, setSubmitForm] = useState({
    completionEvidence: '',
    evidenceAttachment: '',
  });

  const [reviewForm, setReviewForm] = useState({
    action: 'APPROVE' as 'APPROVE' | 'REJECT',
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchMetadata();
    fetchTasks();
  }, [statusFilter, priorityFilter, search]);

  const fetchMetadata = async () => {
    try {
      const [tRes, cRes, lRes] = await Promise.all([
        api.get('/auth/team'),
        api.get('/clients', { limit: 100 }),
        api.get('/leads', { limit: 100 }),
      ]);
      if (tRes.success) setTeamMembers(tRes.data || []);
      if (cRes.success) setClientsList(cRes.data || []);
      if (lRes.success) setLeadsList(lRes.data || []);
    } catch (e) {}
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', {
        status: statusFilter,
        priority: priorityFilter,
        search,
      });
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success) {
        setSubmitForm(prev => ({ ...prev, evidenceAttachment: res.fileUrl }));
      }
    } catch (err) {
      alert('File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/tasks', createForm);
      if (res.success) {
        setIsCreateModalOpen(false);
        setCreateForm({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assignedToId: '',
          clientId: '',
          leadId: '',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        });
        fetchTasks();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/tasks/${selectedTask.id}/submit`, submitForm);
      if (res.success) {
        setIsSubmitModalOpen(false);
        setSubmitForm({ completionEvidence: '', evidenceAttachment: '' });
        fetchTasks();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/tasks/${selectedTask.id}/review`, reviewForm);
      if (res.success) {
        setIsReviewModalOpen(false);
        fetchTasks();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to review task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const isManagerOrAdmin = ['MANAGER', 'CEO', 'ADMIN'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Task & Activity Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign work items, track due dates, submit completion proofs, and review evidence
          </p>
        </div>
        {isManagerOrAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Assign New Task
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tasks found matching your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isAssignedToMe = task.assignedToId === user?.id;
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

              return (
                <div key={task.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-lg">
                        {task.taskId}
                      </span>
                      <StatusBadge status={task.status} type="task" />
                      <StatusBadge status={task.priority} type="priority" />
                      {task.client && (
                        <span className="text-xs text-slate-500 font-medium">
                          &bull; {task.client.organization}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-2 leading-tight">
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                      {task.description}
                    </p>

                    {/* Completion Evidence if present */}
                    {task.completionEvidence && (
                      <div className="mt-3 p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs">
                        <span className="font-bold text-purple-900">Submitted Evidence:</span>{' '}
                        <span className="text-slate-700">{task.completionEvidence}</span>
                        {task.evidenceAttachment && (
                          <div className="mt-1">
                            <a
                              href={task.evidenceAttachment}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              <Paperclip className="w-3.5 h-3.5" /> View Attached Document / Photo
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manager Review Remarks if present */}
                    {task.managerReviewRemarks && (
                      <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                        <span className="font-bold">Manager Review ({task.reviewedBy?.name || 'Manager'}):</span> {task.managerReviewRemarks}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Assigned to: <strong className="text-slate-700">{task.assignedTo.name}</strong>
                      </span>
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions depending on role & status */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Employee Actions */}
                    {isAssignedToMe && task.status !== 'COMPLETED' && task.status !== 'PENDING_REVIEW' && (
                      <>
                        {task.status === 'NOT_STARTED' && (
                          <button
                            onClick={() => handleQuickStatus(task.id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                          >
                            Start Task
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setSubmitForm({ completionEvidence: '', evidenceAttachment: '' });
                            setIsSubmitModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Evidence
                        </button>
                      </>
                    )}

                    {/* Manager Review Actions */}
                    {isManagerOrAdmin && task.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setReviewForm({ action: 'APPROVE', remarks: 'Approved. Completed as required.' });
                          setIsReviewModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" /> Review & Approve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign New Employee Task"
        subtitle="Specify task scope, deadline, and assign to marketing executive"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Prepare tailored quotation for Apex Logistics"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Employee *</label>
              <select
                required
                value={createForm.assignedToId}
                onChange={(e) => setCreateForm({ ...createForm, assignedToId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Select executive...</option>
                {teamMembers
                  .filter((m) => m.role === 'EMPLOYEE')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.designation}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Linked Client (Optional)</label>
              <select
                value={createForm.clientId}
                onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">None / General</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.organization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Description & Instructions *</label>
            <textarea
              rows={4}
              required
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Outline specific deliverables, milestones, and customer requirements..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Evidence Modal (Employee) */}
      {selectedTask && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title={`Submit Work Evidence: ${selectedTask.taskId}`}
          subtitle={`Task: ${selectedTask.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmitEvidence} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Completion Summary *</label>
              <textarea
                rows={4}
                required
                value={submitForm.completionEvidence}
                onChange={(e) => setSubmitForm({ ...submitForm, completionEvidence: e.target.value })}
                placeholder="Describe actions taken, outcomes achieved, client responses received..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload Supporting File / Evidence</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                />
                {uploadingFile && <span className="text-xs text-slate-400">Uploading...</span>}
              </div>
              {submitForm.evidenceAttachment && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  File uploaded: {submitForm.evidenceAttachment}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingFile}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Manager Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review Modal (Manager) */}
      {selectedTask && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Task Submission: ${selectedTask.taskId}`}
          subtitle={`Submitted by ${selectedTask.assignedTo?.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleReviewTask} className="space-y-4">
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-slate-700">
              <span className="font-bold text-purple-900">Submitted Proof:</span> {selectedTask.completionEvidence}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, action: 'APPROVE' })}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  reviewForm.action === 'APPROVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approve Completion
              </button>

              <button
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, action: 'REJECT' })}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  reviewForm.action === 'REJECT'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" /> Request Rework
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Manager Feedback / Remarks *</label>
              <textarea
                rows={3}
                required
                value={reviewForm.remarks}
                onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                placeholder="Enter feedback for employee..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md ${
                  reviewForm.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : reviewForm.action === 'APPROVE' ? 'Confirm Approval' : 'Send Back for Rework'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

