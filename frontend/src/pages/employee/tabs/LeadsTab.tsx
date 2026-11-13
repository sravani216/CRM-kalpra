import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { Lead, LeadNote, LeadStatus } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { Drawer } from '../../../components/common/Drawer';
import { Modal } from '../../../components/common/Modal';
import {
  Search,
  Plus,
  MapPin,
  Phone,
  MessageSquare,
  Send,
  Building2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

export const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  // Drawer state for selected lead notes
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status updating in drawer
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    designation: '',
    area: '',
    contact: '',
    approachType: 'Call',
    status: 'NEW' as LeadStatus,
  });
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [areaFilter]);

  const fetchLeads = async () => {
    try {
      const res = await api.get<{ success: boolean; leads: Lead[] }>('/leads', {
        search: search.trim() || undefined,
        area: areaFilter || undefined,
      });
      setLeads(res.leads || []);
      // If a lead is currently open in drawer, update its data
      if (selectedLead) {
        const refreshed = (res.leads || []).find((l) => l.id === selectedLead.id);
        if (refreshed) setSelectedLead(refreshed);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingLead(true);
    try {
      const res = await api.post<{ success: boolean; lead: Lead }>('/leads', formData);
      if (res.lead) {
        setLeads((prev) => [res.lead, ...prev]);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          companyName: '',
          designation: '',
          area: '',
          contact: '',
          approachType: 'Call',
          status: 'NEW',
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create lead.');
    } finally {
      setIsCreatingLead(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await api.post<{ success: boolean; note: LeadNote }>(
        `/leads/${selectedLead.id}/notes`,
        { content: newNoteContent.trim() }
      );
      if (res.note) {
        const updatedNotes = [res.note, ...(selectedLead.notes || [])];
        const updatedLead = { ...selectedLead, notes: updatedNotes };
        setSelectedLead(updatedLead);
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
        setNewNoteContent('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleUpdateStatus = async (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch<{ success: boolean; lead: Lead }>(`/leads/${selectedLead.id}`, {
        status: newStatus,
      });
      if (res.lead) {
        const updatedLead = { ...selectedLead, status: res.lead.status, deal: res.lead.deal };
        setSelectedLead(updatedLead);
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Distinct areas for filter dropdown
  const uniqueAreas = Array.from(new Set(leads.map((l) => l.area).filter(Boolean)));

  const leadStatuses: LeadStatus[] = [
    'NEW',
    'APPROACHED',
    'FOLLOW_UP',
    'MEETING_SCHEDULED',
    'CONVERTED',
    'LOST',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search & Area Filter */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client, company or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            />
          </div>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 text-slate-700 font-medium"
          >
            <option value="">All Areas</option>
            {uniqueAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </form>

        {/* New Lead Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs shadow-pink-200 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Clean Lead List */}
      <div className="bg-white rounded-2xl border border-pink-100/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-pink-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Assigned Leads ({leads.length})
          </h3>
          <span className="text-xs text-slate-400">Click any lead to view or add notes</span>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs font-semibold text-slate-500">No leads found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search or add a new lead.</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-50/70">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="p-4 hover:bg-pink-50/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                {/* 1. Name & Designation */}
                <div className="w-1/3 min-w-0 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition-colors truncate">
                      {lead.name}
                    </span>
                    {lead.designation && (
                      <span className="text-[11px] text-slate-400 truncate">
                        • {lead.designation}
                      </span>
                    )}
                  </div>
                  {lead.companyName && (
                    <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5 truncate">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{lead.companyName}</span>
                    </div>
                  )}
                </div>

                {/* 2. Area & Contact */}
                <div className="w-1/3 min-w-0 pr-4 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="font-semibold text-slate-700">{lead.area}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mt-0.5 truncate">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span>{lead.contact}</span>
                  </div>
                </div>

                {/* 3. Status & Approach Pill */}
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100/60">
                    {lead.approachType}
                  </span>
                  <Badge status={lead.status} size="sm" />
                  <div className="flex items-center space-x-1 text-slate-400 group-hover:text-pink-600">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{lead.notes?.length || 0}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-pink-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* On-Click Lead Notes Drawer */}
      <Drawer
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.name || 'Lead Details'}
        subtitle={selectedLead?.companyName ? `${selectedLead.companyName} • ${selectedLead.area}` : selectedLead?.area}
      >
        {selectedLead && (
          <div className="space-y-6">
            {/* Status & Revive Selector */}
            <div className="p-4 rounded-xl border border-pink-100 bg-[#FFF9FB]">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Lead Status (Change to update or revive):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {leadStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    disabled={isUpdatingStatus}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedLead.status === st
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-pink-100/60 border border-pink-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
              {selectedLead.status === 'LOST' && (
                <p className="text-[11px] text-slate-400 mt-2">
                  💡 This lead is marked LOST. Click any stage above to revive it (e.g. Follow Up).
                </p>
              )}
            </div>

            {/* Client Contact Quick Card */}
            <div className="text-xs space-y-1.5 p-3.5 rounded-xl border border-pink-100/80 bg-white">
              <div className="flex justify-between">
                <span className="text-slate-400">Designation:</span>
                <span className="font-semibold text-slate-700">{selectedLead.designation || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact:</span>
                <span className="font-semibold text-slate-700">{selectedLead.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Approach Mode:</span>
                <span className="font-semibold text-slate-700">{selectedLead.approachType}</span>
              </div>
            </div>

            {/* Note Thread */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Note History ({selectedLead.notes?.length || 0})
                </h4>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-4">
                <textarea
                  required
                  rows={3}
                  placeholder="Add discovery meeting remarks, client objections, or next steps..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full text-xs text-slate-800 p-3 rounded-xl border border-pink-100 bg-pink-50/20 focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submittingNote || !newNoteContent.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                  >
                    <span>{submittingNote ? 'Saving...' : 'Add Note'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Thread list */}
              <div className="space-y-3">
                {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notes on this lead yet.</p>
                ) : (
                  selectedLead.notes.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-xl border border-pink-100 bg-white">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700">
                          {note.author?.name || 'Team Member'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead"
        subtitle="Capture a new prospect or client meeting"
      >
        <form onSubmit={handleCreateLead} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Roy"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Solutions"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="e.g. Director"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Area / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hitec City"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact (Phone / Email) *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Approach Type</label>
              <select
                value={formData.approachType}
                onChange={(e) => setFormData({ ...formData, approachType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              >
                <option value="Call">Call</option>
                <option value="Visit">Visit</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              >
                <option value="NEW">New</option>
                <option value="APPROACHED">Approached</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
              </select>
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
              disabled={isCreatingLead}
              className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs"
            >
              {isCreatingLead ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

