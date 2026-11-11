import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Target,
  Search,
  Plus,
  Filter,
  Users,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  UserCheck,
  PhoneCall,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export const Leads: React.FC = () => {
  const { user } = useAuth();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    clientId: '',
    title: '',
    source: 'Website',
    priority: 'MEDIUM',
    requirement: '',
    expectedValue: 500000,
    assignedToId: '',
    nextFollowUpDate: '',
  });

  const [assignForm, setAssignForm] = useState({
    assignedToId: '',
    notes: '',
  });

  const [statusForm, setStatusForm] = useState({
    status: 'CONTACTED',
    remarks: '',
    reason: '',
  });

  const [activityForm, setActivityForm] = useState({
    type: 'CALL',
    title: '',
    description: '',
    durationMinutes: 15,
    outcome: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamAndClients();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, priorityFilter, employeeFilter, page]);

  const fetchTeamAndClients = async () => {
    try {
      const [teamRes, clientRes] = await Promise.all([
        api.get('/auth/team'),
        api.get('/clients', { limit: 100 }),
      ]);
      if (teamRes.success) setTeamMembers(teamRes.data || []);
      if (clientRes.success) setClientsList(clientRes.data || []);
    } catch (e) {}
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        search,
        status: statusFilter,
        priority: priorityFilter,
        assignedToId: employeeFilter,
        page,
        limit: 12,
      });
      if (res.success) {
        setLeads(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotal(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/leads', {
        ...createForm,
        expectedValue: Number(createForm.expectedValue),
      });
      if (res.success) {
        setIsAddModalOpen(false);
        setCreateForm({
          clientId: '',
          title: '',
          source: 'Website',
          priority: 'MEDIUM',
          requirement: '',
          expectedValue: 500000,
          assignedToId: '',
          nextFollowUpDate: '',
        });
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/leads/${selectedLead.id}/assign`, assignForm);
      if (res.success) {
        setIsAssignModalOpen(false);
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/leads/${selectedLead.id}/status`, {
        status: statusForm.status,
        remarks: statusForm.remarks,
        lostReason: statusForm.status === 'LOST' ? statusForm.reason : undefined,
        holdReason: statusForm.status === 'ON_HOLD' ? statusForm.reason : undefined,
      });
      if (res.success) {
        setIsStatusModalOpen(false);
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/leads/${selectedLead.id}/activity`, {
        ...activityForm,
        durationMinutes: Number(activityForm.durationMinutes),
      });
      if (res.success) {
        setIsActivityModalOpen(false);
        setActivityForm({
          type: 'CALL',
          title: '',
          description: '',
          durationMinutes: 15,
          outcome: '',
        });
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManageLeads = ['ADMIN', 'CEO', 'MANAGER'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lead Pipeline & Allocation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track prospective client opportunities, employee assignments, and conversion progress
          </p>
        </div>
        {canManageLeads && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Lead
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by title, ID, client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {canManageLeads && (
            <select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned Only</option>
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="DEMO_SCHEDULED">Demo Scheduled</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
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

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No leads found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-5">Lead ID & Title</th>
                  <th className="py-3 px-5">Client Organization</th>
                  <th className="py-3 px-5">Assigned Employee</th>
                  <th className="py-3 px-5">Expected Value</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Contacted</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-800">{l.leadId}</div>
                      <div className="text-slate-600 font-medium mt-0.5">{l.title}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-800">{l.client.organization}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{l.client.location}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      {l.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={l.assignedTo.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={l.assignedTo.name}
                            className="w-6 h-6 rounded-full object-cover border"
                          />
                          <span className="font-semibold text-slate-800">{l.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      INR {l.expectedValue?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={l.priority} type="priority" />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={l.status} type="lead" />
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.hasContacted ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {l.hasContacted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign / Reassign Button */}
                        {canManageLeads && (
                          <button
                            onClick={() => {
                              setSelectedLead(l);
                              setAssignForm({ assignedToId: l.assignedToId || '', notes: '' });
                              setIsAssignModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Assign or Reassign Employee"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Status Change Button */}
                        <button
                          onClick={() => {
                            setSelectedLead(l);
                            setStatusForm({ status: l.status, remarks: '', reason: '' });
                            setIsStatusModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Update Lead Stage / Status"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>

                        {/* Log Activity Button */}
                        <button
                          onClick={() => {
                            setSelectedLead(l);
                            setActivityForm({
                              type: 'CALL',
                              title: `Discussion with ${l.client.name}`,
                              description: '',
                              durationMinutes: 15,
                              outcome: 'Positive discussion',
                            });
                            setIsActivityModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Record Call / Meeting Discussion"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{leads.length}</span> of <span className="font-bold text-slate-700">{total}</span> leads
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Sales Lead"
        subtitle="Associate prospective requirement with a registered client"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Client Organization *</label>
            <select
              required
              value={createForm.clientId}
              onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Choose client...</option>
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientId} - {c.organization} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lead Title / Opportunity Name *</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Enterprise CRM Cloud Rollout"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Deal Value (INR) *</label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={createForm.expectedValue}
                onChange={(e) => setCreateForm({ ...createForm, expectedValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
              <select
                value={createForm.source}
                onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Website">Website</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Referral">Referral</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Allocate Employee (Optional)</label>
              <select
                value={createForm.assignedToId}
                onChange={(e) => setCreateForm({ ...createForm, assignedToId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Leave Unassigned</option>
                {teamMembers
                  .filter((m) => m.role === 'EMPLOYEE')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.designation})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Requirement *</label>
            <textarea
              rows={3}
              required
              value={createForm.requirement}
              onChange={(e) => setCreateForm({ ...createForm, requirement: e.target.value })}
              placeholder="Describe deliverables, scope, and technical requirements..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20"
            >
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign / Reassign Modal */}
      {selectedLead && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Lead: ${selectedLead.leadId}`}
          subtitle={`Current Assignee: ${selectedLead.assignedTo?.name || 'Unassigned'}`}
          maxWidth="md"
        >
          <form onSubmit={handleAssignLead} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
              <select
                required
                value={assignForm.assignedToId}
                onChange={(e) => setAssignForm({ ...assignForm, assignedToId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Choose executive...</option>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Remarks / Notes</label>
              <textarea
                rows={3}
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                placeholder="Special instructions or background context..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update Status Modal */}
      {selectedLead && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Lead Status: ${selectedLead.leadId}`}
          subtitle={`Current Stage: ${selectedLead.status}`}
          maxWidth="md"
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Stage / Status *</label>
              <select
                required
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                <option value="PROPOSAL_SENT">Proposal Sent</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Won (Deal Conversion)</option>
                <option value="LOST">Lost</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            {(statusForm.status === 'LOST' || statusForm.status === 'ON_HOLD') && (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">
                  Reason for {statusForm.status === 'LOST' ? 'Lost Opportunity' : 'Placing On Hold'} *
                </label>
                <input
                  type="text"
                  required
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  placeholder="e.g. Budget deferral to Q4, competitor pricing..."
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Progress Remarks</label>
              <textarea
                rows={3}
                value={statusForm.remarks}
                onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                placeholder="Add meeting outcome, proposal revisions, or timeline..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Activity Modal */}
      {selectedLead && (
        <Modal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          title={`Log Interaction Activity`}
          subtitle={`Lead: ${selectedLead.leadId} &bull; ${selectedLead.client?.organization}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordActivity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Activity Type *</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="CALL">Call</option>
                  <option value="MEETING">Meeting</option>
                  <option value="DISCUSSION">Client Discussion</option>
                  <option value="DEMO">Product Demo</option>
                  <option value="PROPOSAL">Proposal Submission</option>
                  <option value="NOTE">Note</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  min={1}
                  value={activityForm.durationMinutes}
                  onChange={(e) => setActivityForm({ ...activityForm, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discussion Subject / Title *</label>
              <input
                type="text"
                required
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                placeholder="e.g. Discovery call regarding 50 user license"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interaction Outcome / Response</label>
              <input
                type="text"
                value={activityForm.outcome}
                onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                placeholder="e.g. Client agreed to schedule demo on Thursday"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discussion Details</label>
              <textarea
                rows={3}
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                placeholder="Log discussion points, objections raised, agreed next steps..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Recording...' : 'Log Activity'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

