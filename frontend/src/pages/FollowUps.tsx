import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  CalendarClock,
  Search,
  Plus,
  Phone,
  Video,
  Users,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  List,
  ArrowRight
} from 'lucide-react';

export const FollowUps: React.FC = () => {
  const { user } = useAuth();

  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<any>(null);

  // Lists for dropdown
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Forms
  const [scheduleForm, setScheduleForm] = useState({
    clientId: '',
    leadId: '',
    scheduledDate: new Date().toISOString().split('T')[0] + 'T14:00',
    type: 'Call',
    discussionNotes: '',
  });

  const [completeForm, setCompleteForm] = useState({
    callOutcome: 'Positive & Interested',
    clientResponse: '',
    discussionNotes: '',
    scheduleNext: false,
    nextFollowUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + 'T11:00',
    nextFollowUpType: 'Call',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchFollowups();
  }, [filter]);

  const fetchMetadata = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/clients', { limit: 100 }),
        api.get('/leads', { limit: 100 }),
      ]);
      if (cRes.success) setClientsList(cRes.data || []);
      if (lRes.success) setLeadsList(lRes.data || []);
    } catch (e) {}
  };

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/followups', { filter });
      if (res.success) {
        setFollowups(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load followups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/followups', scheduleForm);
      if (res.success) {
        setIsScheduleModalOpen(false);
        setScheduleForm({
          clientId: '',
          leadId: '',
          scheduledDate: new Date().toISOString().split('T')[0] + 'T14:00',
          type: 'Call',
          discussionNotes: '',
        });
        fetchFollowups();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to schedule follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowup) return;
    setIsSubmitting(true);
    try {
      const res = await api.put(`/followups/${selectedFollowup.id}/complete`, {
        callOutcome: completeForm.callOutcome,
        clientResponse: completeForm.clientResponse,
        discussionNotes: completeForm.discussionNotes,
        nextFollowUpDate: completeForm.scheduleNext ? completeForm.nextFollowUpDate : undefined,
        nextFollowUpType: completeForm.scheduleNext ? completeForm.nextFollowUpType : undefined,
      });

      if (res.success) {
        setIsCompleteModalOpen(false);
        fetchFollowups();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call':
        return <Phone className="w-4 h-4 text-brand-500" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'video conference':
        return <Video className="w-4 h-4 text-sky-500" />;
      case 'field visit':
        return <MapPin className="w-4 h-4 text-teal-500" />;
      default:
        return <Mail className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Client Follow-up Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain client engagement momentum, schedule calls, and record interaction outcomes
          </p>
        </div>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule Follow-up
        </button>
      </div>

      {/* Tabs and View Switcher */}
      <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1">
          {[
            { key: 'today', label: "Due Today" },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'completed', label: 'Completed' },
            { key: 'all', label: 'All Follow-ups' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              viewMode === 'calendar' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading follow-ups...</div>
        ) : followups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No follow-ups found for category: <span className="font-bold capitalize">{filter}</span>
          </div>
        ) : viewMode === 'list' ? (
          <div className="divide-y divide-slate-100">
            {followups.map((f) => {
              const isOverdue = new Date(f.scheduledDate) < new Date() && f.status === 'SCHEDULED';

              return (
                <div key={f.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl shrink-0 mt-0.5">
                      {getTypeIcon(f.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">{f.client.name}</span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs font-semibold text-slate-600">{f.client.organization}</span>
                        <StatusBadge status={f.status} type="followup" />
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        Lead: <strong className="text-slate-800">{f.lead.leadId}</strong> - {f.lead.title}
                      </p>

                      {f.discussionNotes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">
                          Agenda: &ldquo;{f.discussionNotes}&rdquo;
                        </p>
                      )}

                      {/* Completed Outcomes */}
                      {f.status === 'COMPLETED' && (
                        <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                          <div><span className="font-bold">Outcome:</span> {f.callOutcome}</div>
                          {f.clientResponse && <div className="mt-0.5"><span className="font-bold">Client Response:</span> {f.clientResponse}</div>}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Executive: <strong className="text-slate-600">{f.user.name}</strong>
                        </span>
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                          <Clock className="w-3.5 h-3.5" /> Scheduled: {new Date(f.scheduledDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Button */}
                  {f.status === 'SCHEDULED' && (
                    <button
                      onClick={() => {
                        setSelectedFollowup(f);
                        setCompleteForm({
                          callOutcome: 'Positive & Interested',
                          clientResponse: '',
                          discussionNotes: '',
                          scheduleNext: false,
                          nextFollowUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + 'T11:00',
                          nextFollowUpType: 'Call',
                        });
                        setIsCompleteModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Record Outcome
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Calendar Style Grid View */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followups.map((f) => (
              <div key={f.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 card-hover flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {getTypeIcon(f.type)}
                      <span className="text-xs font-bold text-slate-700">{f.type}</span>
                    </div>
                    <StatusBadge status={f.status} type="followup" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{f.client.organization}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{f.lead.title}</p>
                  <p className="text-[11px] text-brand-600 font-semibold mt-2">
                    {new Date(f.scheduledDate).toLocaleString()}
                  </p>
                </div>
                {f.status === 'SCHEDULED' && (
                  <button
                    onClick={() => {
                      setSelectedFollowup(f);
                      setIsCompleteModalOpen(true);
                    }}
                    className="mt-3 w-full py-1.5 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    Record Outcome
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Client Follow-up"
        subtitle="Set up upcoming interaction and reminder"
        maxWidth="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Client *</label>
            <select
              required
              value={scheduleForm.clientId}
              onChange={(e) => {
                const cId = e.target.value;
                const matchLead = leadsList.find((l) => l.clientId === cId);
                setScheduleForm({
                  ...scheduleForm,
                  clientId: cId,
                  leadId: matchLead ? matchLead.id : scheduleForm.leadId,
                });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Choose client...</option>
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.organization} ({c.contactPerson})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Lead *</label>
            <select
              required
              value={scheduleForm.leadId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, leadId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Choose lead...</option>
              {leadsList
                .filter((l) => !scheduleForm.clientId || l.clientId === scheduleForm.clientId)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.leadId} - {l.title}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Channel / Type</label>
              <select
                value={scheduleForm.type}
                onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Call">Phone Call</option>
                <option value="Meeting">In-Person Meeting</option>
                <option value="Video Conference">Video Conference</option>
                <option value="Field Visit">Field Visit</option>
                <option value="Email">Email Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Discussion Agenda / Goal</label>
            <textarea
              rows={3}
              value={scheduleForm.discussionNotes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, discussionNotes: e.target.value })}
              placeholder="e.g. Discuss revised proposal pricing and onboarding milestones..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Outcome Modal */}
      {selectedFollowup && (
        <Modal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          title="Record Call Outcome & Client Response"
          subtitle={`Interaction with: ${selectedFollowup.client?.organization}`}
          maxWidth="md"
        >
          <form onSubmit={handleCompleteSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Call Outcome *</label>
              <select
                required
                value={completeForm.callOutcome}
                onChange={(e) => setCompleteForm({ ...completeForm, callOutcome: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Positive & Interested">Positive & Interested</option>
                <option value="Demo Requested">Demo Requested</option>
                <option value="Proposal Requested">Proposal Requested</option>
                <option value="Needs Follow-up Callback">Needs Follow-up Callback</option>
                <option value="Busy / Call Rescheduled">Busy / Call Rescheduled</option>
                <option value="No Answer / Voicemail">No Answer / Voicemail</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Response Summary *</label>
              <textarea
                rows={3}
                required
                value={completeForm.clientResponse}
                onChange={(e) => setCompleteForm({ ...completeForm, clientResponse: e.target.value })}
                placeholder="What did the client say? Specific feedback or requirements..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Next Action Scheduling */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={completeForm.scheduleNext}
                  onChange={(e) => setCompleteForm({ ...completeForm, scheduleNext: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Schedule Next Follow-up Action
                </span>
              </label>

              {completeForm.scheduleNext && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Channel</label>
                    <select
                      value={completeForm.nextFollowUpType}
                      onChange={(e) => setCompleteForm({ ...completeForm, nextFollowUpType: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Video Conference">Video Conference</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={completeForm.nextFollowUpDate}
                      onChange={(e) => setCompleteForm({ ...completeForm, nextFollowUpDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Save Follow-up Result'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

