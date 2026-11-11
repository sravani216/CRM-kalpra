import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users,
  Search,
  Plus,
  Filter,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Briefcase,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';

export const Clients: React.FC = () => {
  const { user } = useAuth();

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
    industry: '',
    requirement: '',
    source: 'Direct',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  // Client Details Modal State
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search, industryFilter, statusFilter, page]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        search,
        industry: industryFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setClients(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotal(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live duplicate checking on blur
  const checkDuplicate = async () => {
    if (!formData.phone && !formData.email && !formData.organization) return;
    try {
      const res = await api.post('/clients/check-duplicate', {
        phone: formData.phone,
        email: formData.email,
        organization: formData.organization,
      });
      if (res.success && res.hasDuplicate) {
        setDuplicateWarning(res.duplicates[0]);
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {}
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/clients', formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          organization: '',
          contactPerson: '',
          phone: '',
          email: '',
          location: '',
          industry: '',
          requirement: '',
          source: 'Direct',
          notes: '',
        });
        setDuplicateWarning(null);
        fetchClients();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openClientProfile = async (id: string) => {
    setLoadingDetails(true);
    setSelectedClient(null);
    try {
      const res = await api.get(`/clients/${id}`);
      if (res.success) {
        setSelectedClient(res.data);
      }
    } catch (err) {
      alert('Failed to load client details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const canManageClients = ['ADMIN', 'CEO', 'MANAGER'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Client Organizations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corporate client accounts, contacts, and historical relationship profiles
          </p>
        </div>
        {canManageClients && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Client
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, org, phone, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Industries</option>
            <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
            <option value="Healthcare & Biotech">Healthcare & Biotech</option>
            <option value="Financial Services & Wealth Management">Financial Services</option>
            <option value="Retail & eCommerce">Retail & eCommerce</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Agriculture & Manufacturing">Agriculture & Manufacturing</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Listing Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No clients match the specified criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-5">Client ID</th>
                  <th className="py-3 px-5">Organization & Contact</th>
                  <th className="py-3 px-5">Contact Details</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Industry</th>
                  <th className="py-3 px-5">Leads Count</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-brand-600">
                      {c.clientId}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-800">{c.organization}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.contactPerson}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-700">{c.phone}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                        {c.industry}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      {c._count?.leads || 0}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openClientProfile(c.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 font-bold text-slate-700 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        Profile <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{clients.length}</span> of <span className="font-bold text-slate-700">{total}</span> clients
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

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setDuplicateWarning(null);
        }}
        title="Register New Client Organization"
        subtitle="Automatic Client ID generation with real-time duplicate screening"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddClientSubmit} className="space-y-4">
          {duplicateWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Possible Duplicate Detected</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  An existing client matching this organization, phone or email was found: <span className="font-bold">{duplicateWarning.clientId} - {duplicateWarning.organization}</span> ({duplicateWarning.phone}).
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization Name *</label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                onBlur={checkDuplicate}
                placeholder="e.g. Acme Corp India"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Title / Brand Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Acme Logistics Suite"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={checkDuplicate}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={checkDuplicate}
                placeholder="contact@acme.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / City *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Hyderabad, Telangana"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector *</label>
              <select
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Select industry</option>
                <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                <option value="Financial Services & Wealth Management">Financial Services</option>
                <option value="Retail & eCommerce">Retail & eCommerce</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Agriculture & Manufacturing">Agriculture & Manufacturing</option>
                <option value="Real Estate & Construction">Real Estate & Construction</option>
                <option value="Education & EdTech">Education & EdTech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Acquisition Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="Direct">Direct</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Website">Website Inbound</option>
                <option value="Referral">Executive Referral</option>
                <option value="Exhibition">Exhibition / Expo</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client Requirement *</label>
            <textarea
              rows={3}
              required
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              placeholder="Describe software needs, user seats, deployment timeline..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal remarks for marketing team..."
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
              {isSubmitting ? 'Registering...' : 'Register Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Client Detailed Profile Modal */}
      {selectedClient && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title={`Client Profile: ${selectedClient.organization}`}
          subtitle={`Client ID: ${selectedClient.clientId} &bull; Registered on ${new Date(selectedClient.createdAt).toLocaleDateString()}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Person</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedClient.contactPerson}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedClient.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{selectedClient.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedClient.location}</p>
              </div>
            </div>

            {/* Requirement & Source */}
            <div className="p-4 bg-brand-50/40 rounded-2xl border border-brand-100">
              <span className="text-xs font-bold text-brand-900">Recorded Requirement:</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedClient.requirement}</p>
              {selectedClient.notes && (
                <p className="text-[11px] text-slate-500 mt-2 italic">Notes: {selectedClient.notes}</p>
              )}
            </div>

            {/* Associated Leads */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Associated Leads ({selectedClient.leads?.length || 0})
              </h4>
              {selectedClient.leads?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No leads created for this client yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedClient.leads.map((l: any) => (
                    <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{l.leadId}: {l.title}</span>
                          <StatusBadge status={l.status} type="lead" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Assigned: <span className="font-semibold">{l.assignedTo?.name || 'Unassigned'}</span> &bull; Expected: ₹{l.expectedValue?.toLocaleString()} INR
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Associated Deals */}
            {selectedClient.deals?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  Closed Deals ({selectedClient.deals.length})
                </h4>
                <div className="space-y-2">
                  {selectedClient.deals.map((d: any) => (
                    <div key={d.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-900">{d.dealId}: {d.title}</span>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Amount: ₹{d.amount?.toLocaleString()} INR &bull; Closed by {d.closedBy?.name || 'Staff'}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Won
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Field Check-in Photos for this client if any */}
            {selectedClient.fieldCheckins?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Field Visits & Location Photos ({selectedClient.fieldCheckins.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedClient.fieldCheckins.map((fc: any) => (
                    <div key={fc.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                      <img src={fc.photoUrl} alt="Field visit" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{fc.locationName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">By {fc.user.name}</p>
                        <p className="text-[10px] text-slate-400">{new Date(fc.checkinTime).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

