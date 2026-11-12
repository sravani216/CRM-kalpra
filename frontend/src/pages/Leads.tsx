import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Search,
  Plus,
  Filter,
  Eye,
  FileText,
  MapPin,
  Phone,
  Building2,
  Calendar,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface Lead {
  id: string;
  leadId: string;
  clientId: string;
  contactPerson: string;
  designation: string;
  companyName: string;
  area: string;
  contactNumber: string;
  status: string;
  priority: string;
  requirement: string;
  dealValue: number;
  source: string;
  notes?: string;
  assignedToId?: string;
  createdAt: string;
}

export const Leads: React.FC = () => {
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');

  // Modals
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [notesLead, setNotesLead] = useState<Lead | null>(null);
  const [leadNoteText, setLeadNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    designation: '',
    companyName: '',
    area: 'Hitec City, Hyderabad',
    contactNumber: '',
    email: '',
    requirement: '',
    expectedValue: 450000,
    priority: 'MEDIUM',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      if (res.success && res.data) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotes = (lead: Lead) => {
    setNotesLead(lead);
    setLeadNoteText(lead.notes || '');
  };

  const handleSaveLeadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesLead) return;
    setIsSavingNote(true);
    try {
      await api.patch(`/leads/${notesLead.id}/notes`, { notes: leadNoteText });
      setLeads((prev) =>
        prev.map((l) => (l.id === notesLead.id ? { ...l, notes: leadNoteText } : l))
      );
      setNotesLead(null);
    } catch (err) {
      alert('Failed to save lead notes');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim() || !newLeadForm.contactNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/leads', {
        contactPerson: newLeadForm.name,
        name: newLeadForm.name,
        designation: newLeadForm.designation || 'Manager',
        companyName: newLeadForm.companyName || `${newLeadForm.name} Enterprises`,
        area: newLeadForm.area,
        contactNumber: newLeadForm.contactNumber,
        requirement: newLeadForm.requirement,
        dealValue: Number(newLeadForm.expectedValue),
        priority: newLeadForm.priority,
        notes: newLeadForm.notes,
        status: 'Interested',
      });

      if (res.success) {
        setIsNewLeadModalOpen(false);
        setNewLeadForm({
          name: '',
          designation: '',
          companyName: '',
          area: 'Hitec City, Hyderabad',
          contactNumber: '',
          email: '',
          requirement: '',
          expectedValue: 450000,
          priority: 'MEDIUM',
          notes: '',
        });
        fetchLeads();
      }
    } catch (err) {
      alert('Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract unique areas for filter
  const areas = Array.from(
    new Set(leads.map((l) => l.area).filter(Boolean))
  );

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      l.designation?.toLowerCase().includes(search.toLowerCase()) ||
      l.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      l.area?.toLowerCase().includes(search.toLowerCase()) ||
      l.contactNumber?.includes(search) ||
      l.leadId?.toLowerCase().includes(search.toLowerCase());

    const matchesArea =
      selectedArea === 'ALL' || (l.area && l.area.includes(selectedArea));

    return matchesSearch && matchesArea;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('won')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (s.includes('interest')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (s.includes('demo') || s.includes('schedul')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (s.includes('proposal') || s.includes('negot')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (s.includes('lost') || s.includes('not interest')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Sleek Page Header (Clean & Modern) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lead Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track prospective client contacts, write real-time notes, filter by territory area, and register new leads.
          </p>
        </div>

        <button
          onClick={() => setIsNewLeadModalOpen(true)}
          className="btn-smooth flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register New Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar On Top Of The List */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Bar with Search Button */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, designation, company, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Area Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
            >
              <option value="ALL">All Areas (Territories)</option>
              {areas.map((a, i) => (
                <option key={i} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 self-end md:self-auto">
          <span>Found:</span>
          <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 font-extrabold">
            {filteredLeads.length} Leads
          </span>
        </div>
      </div>

      {/* Leads List / Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">Name along with Designation</th>
                <th className="py-4 px-5">Area & Contact Number</th>
                <th className="py-4 px-5">Status of the Lead</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Target className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No leads found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting the search query or area filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Name along with designation */}
                    <td className="py-4 px-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-50 to-indigo-50 border border-brand-200/50 flex items-center justify-center text-brand-600 font-black text-sm shrink-0">
                          {lead.contactPerson ? lead.contactPerson[0] : 'L'}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight text-sm">
                            {lead.contactPerson}
                          </span>
                          <span className="text-[11px] font-bold text-brand-600 block mt-0.5">
                            {lead.designation}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {lead.companyName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Area and contact number */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {lead.area || 'Hyderabad'}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {lead.contactNumber || '+91 90000 00000'}
                        </span>
                      </div>
                    </td>

                    {/* Status of the lead */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {lead.status}
                      </span>
                      {lead.dealValue && (
                        <span className="block text-[11px] text-slate-500 font-bold mt-1">
                          ₹ {Number(lead.dealValue).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    {/* Actions: small view button & small notes option */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Small notes option */}
                        <button
                          onClick={() => handleOpenNotes(lead)}
                          className="btn-smooth flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100 font-bold text-[11px] transition-all"
                          title="Write notes about this lead"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Notes</span>
                        </button>

                        {/* Small view button */}
                        <button
                          onClick={() => setViewLead(lead)}
                          className="btn-smooth flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 bg-brand-50/70 text-brand-700 hover:bg-brand-100 font-bold text-[11px] transition-all"
                          title="View lead details card"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW LEAD CARD MODAL (Requirement: "show the details in a card") */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20">
                  {viewLead.contactPerson ? viewLead.contactPerson[0] : 'L'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {viewLead.contactPerson}
                  </h3>
                  <p className="text-xs font-bold text-brand-600">{viewLead.designation}</p>
                </div>
              </div>
              <button
                onClick={() => setViewLead(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Card Body */}
            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Company</span>
                  <span className="font-extrabold text-slate-800 text-sm block">
                    {viewLead.companyName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Area / Territory</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {viewLead.area}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {viewLead.contactNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                  <span
                    className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getStatusBadge(
                      viewLead.status
                    )}`}
                  >
                    {viewLead.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Expected Deal Value
                </span>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-black text-emerald-700">
                    ₹ {Number(viewLead.dealValue || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                    Priority: {viewLead.priority || 'MEDIUM'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Requirement Scope
                </span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-medium leading-relaxed">
                  {viewLead.requirement || 'Standard CRM and marketing tracking requirement.'}
                </p>
              </div>

              {viewLead.notes && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Employee Notes on Lead
                  </span>
                  <p className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 font-medium leading-relaxed italic">
                    "{viewLead.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">ID: {viewLead.leadId}</span>
              <button
                onClick={() => setViewLead(null)}
                className="btn-smooth px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMALL NOTES MODAL (Requirement: "a small notes option to write notes about that particular lead") */}
      {notesLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Notes for {notesLead.contactPerson}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {notesLead.designation} • {notesLead.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotesLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lead Observations & Discussion Notes
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record client meeting notes, budget constraints, feature requests, or follow-up notes..."
                  value={leadNoteText}
                  onChange={(e) => setLeadNoteText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNotesLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="btn-amber px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  {isSavingNote ? 'Saving...' : 'Save Lead Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW LEAD REGISTRATION FORM MODAL */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New Lead</h3>
                  <p className="text-xs text-slate-400">Add prospective marketing contact</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewLeadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Murthy"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Procurement Director"
                    value={newLeadForm.designation}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, designation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sigma Tech Logistics Pvt Ltd"
                  value={newLeadForm.companyName}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area (Territory) *
                  </label>
                  <select
                    value={newLeadForm.area}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Hitec City, Hyderabad">Hitec City, Hyderabad</option>
                    <option value="Gachibowli, Hyderabad">Gachibowli, Hyderabad</option>
                    <option value="Madhapur, Hyderabad">Madhapur, Hyderabad</option>
                    <option value="Jubilee Hills, Hyderabad">Jubilee Hills, Hyderabad</option>
                    <option value="Banjara Hills, Hyderabad">Banjara Hills, Hyderabad</option>
                    <option value="Kondapur, Hyderabad">Kondapur, Hyderabad</option>
                    <option value="Begumpet, Hyderabad">Begumpet, Hyderabad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={newLeadForm.contactNumber}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, contactNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={50000}
                    value={newLeadForm.expectedValue}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        expectedValue: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
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
                  Client Requirement
                </label>
                <textarea
                  rows={2}
                  placeholder="Key features required by the client..."
                  value={newLeadForm.requirement}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, requirement: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Notes about that particular lead
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about client background, decision makers..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-smooth px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {isSubmitting ? 'Registering...' : 'Save & Register Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
