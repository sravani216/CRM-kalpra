import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import confetti from 'canvas-confetti';
import {
  Kanban as KanbanIcon,
  Filter,
  DollarSign,
  TrendingUp,
  User,
  AlertTriangle,
  MoveRight,
  Sparkles,
  Trophy,
  XCircle,
  Clock
} from 'lucide-react';

export const SalesPipeline: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Stage Move Modal
  const [movingLead, setMovingLead] = useState<any>(null);
  const [targetStage, setTargetStage] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeam();
    fetchPipeline();
  }, [employeeFilter, priorityFilter]);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/auth/team');
      if (res.success) setTeamMembers(res.data || []);
    } catch (e) {}
  };

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pipeline', {
        assignedToId: employeeFilter,
        priority: priorityFilter,
      });
      if (res.success) {
        setPipelineData(res.data);
      }
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMoveModal = (lead: any, stage: string) => {
    setMovingLead(lead);
    setTargetStage(stage);
    setRemarks('');
    setReason('');
  };

  const handleStageMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingLead || !targetStage) return;

    if (targetStage === 'LOST' && !reason.trim() && !remarks.trim()) {
      alert('A reason is required when marking a lead as Lost.');
      return;
    }
    if (targetStage === 'ON_HOLD' && !reason.trim() && !remarks.trim()) {
      alert('A reason is required when moving a lead to On Hold.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch(`/pipeline/${movingLead.id}/stage`, {
        newStatus: targetStage,
        remarks: remarks.trim(),
        reason: reason.trim(),
      });

      if (res.success) {
        // Trigger celebratory confetti if Won!
        if (targetStage === 'WON') {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f6ef7', '#20c997', '#fcc419', '#845ef7'],
          });
        }

        setMovingLead(null);
        fetchPipeline();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to move stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STAGES = [
    { key: 'NEW', label: 'New Lead', bg: 'bg-slate-50', header: 'border-sky-500' },
    { key: 'ASSIGNED', label: 'Assigned', bg: 'bg-indigo-50/30', header: 'border-indigo-500' },
    { key: 'CONTACTED', label: 'Contacted', bg: 'bg-teal-50/30', header: 'border-teal-500' },
    { key: 'INTERESTED', label: 'Interested', bg: 'bg-cyan-50/30', header: 'border-cyan-500' },
    { key: 'DEMO_SCHEDULED', label: 'Demo Scheduled', bg: 'bg-purple-50/30', header: 'border-purple-500' },
    { key: 'PROPOSAL_SENT', label: 'Proposal Sent', bg: 'bg-blue-50/30', header: 'border-blue-500' },
    { key: 'NEGOTIATION', label: 'Negotiation', bg: 'bg-amber-50/30', header: 'border-amber-500' },
    { key: 'WON', label: 'Won', bg: 'bg-emerald-50/30', header: 'border-emerald-500' },
    { key: 'LOST', label: 'Lost', bg: 'bg-rose-50/30', header: 'border-rose-500' },
    { key: 'ON_HOLD', label: 'On Hold', bg: 'bg-amber-50/20', header: 'border-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Visual Sales Pipeline</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700">
              {pipelineData?.totalLeads || 0} Deals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Pipeline Value: <span className="font-bold text-slate-800">INR {(pipelineData?.totalPipelineValue / 100000 || 0).toFixed(2)} Lakhs</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {user?.role !== 'EMPLOYEE' && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none shadow-sm"
            >
              <option value="">All Team Members</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers
                .filter((m) => m.role === 'EMPLOYEE')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          )}

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none shadow-sm"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">Loading pipeline stages...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {(pipelineData?.columns || []).map((col: any) => {
            const stageConfig = STAGES.find((s) => s.key === col.stage) || {
              bg: 'bg-slate-50',
              header: 'border-slate-400',
            };

            return (
              <div
                key={col.stage}
                className="w-72 shrink-0 flex flex-col bg-slate-50/80 rounded-3xl p-3 border border-slate-100 shadow-sm max-h-[calc(100vh-230px)]"
              >
                {/* Column Header */}
                <div className={`p-3 bg-white rounded-2xl border-l-4 shadow-sm mb-3 ${stageConfig.header}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                      {col.count}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">
                    ₹{(col.totalValue / 1000).toLocaleString()}k INR
                  </div>
                </div>

                {/* Lead Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {col.leads.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-2xl">
                      No leads in this stage
                    </div>
                  ) : (
                    col.leads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover flex flex-col justify-between gap-3 relative group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                              {lead.leadId}
                            </span>
                            <StatusBadge status={lead.priority} type="priority" />
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 mt-2 leading-tight">
                            {lead.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="truncate">{lead.client.organization}</span>
                          </p>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-50 text-[11px]">
                            <span className="font-bold text-slate-800">
                              ₹{lead.expectedValue?.toLocaleString()}
                            </span>
                            <span className="text-slate-400 capitalize">{lead.client.industry?.split(' ')[0]}</span>
                          </div>
                        </div>

                        {/* Card Footer: Assignee & Stage Mover */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {lead.assignedTo ? (
                              <>
                                <img
                                  src={lead.assignedTo.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={lead.assignedTo.name}
                                  className="w-5 h-5 rounded-full object-cover border"
                                />
                                <span className="text-[11px] font-medium text-slate-600 truncate max-w-[80px]">
                                  {lead.assignedTo.name.split(' ')[0]}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-bold">Unassigned</span>
                            )}
                          </div>

                          {/* Quick Stage Move Dropdown */}
                          <div className="relative">
                            <select
                              value={lead.status}
                              onChange={(e) => openMoveModal(lead, e.target.value)}
                              className="text-[10px] font-bold py-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 cursor-pointer focus:outline-none"
                            >
                              <option disabled value={lead.status}>Move &rarr;</option>
                              {STAGES.map((s) => (
                                <option key={s.key} value={s.key} disabled={s.key === lead.status}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stage Move Confirmation Modal */}
      {movingLead && (
        <Modal
          isOpen={!!movingLead}
          onClose={() => setMovingLead(null)}
          title={`Move Lead to ${targetStage.replace(/_/g, ' ')}`}
          subtitle={`Lead: ${movingLead.leadId} - ${movingLead.title}`}
          maxWidth="md"
        >
          <form onSubmit={handleStageMoveSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 flex items-center justify-between">
              <span>Current: <strong className="text-slate-800">{movingLead.status}</strong></span>
              <MoveRight className="w-4 h-4 text-slate-400" />
              <span>Target: <strong className="text-brand-600">{targetStage}</strong></span>
            </div>

            {(targetStage === 'LOST' || targetStage === 'ON_HOLD') && (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">
                  Reason for {targetStage === 'LOST' ? 'Lost Deal' : 'Placing On Hold'} *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify client decision or delay justification..."
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            )}

            {targetStage === 'WON' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Closing this deal will record revenue of ₹{movingLead.expectedValue?.toLocaleString()} INR!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Audit Remarks / Next Steps</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Log notes about this transition..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMovingLead(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Moving...' : 'Confirm Stage Transition'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

