import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DealClosingReportModal } from '../components/reports/DealClosingReportModal';
import {
  Users,
  Search,
  Filter,
  FileCheck2,
  FileText,
  Eye,
  MapPin,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  X,
  IndianRupee,
  Sparkles,
  Download,
  Printer
} from 'lucide-react';

export const ClientsManagement: React.FC = () => {
  const { user } = useAuth();

  const [clients, setClients] = useState<any[]>([]);
  const [dealReports, setDealReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'clients' | 'closingReports'>('clients');

  // Modals
  const [closingModalClient, setClosingModalClient] = useState<any>(null);
  const [viewClient, setViewClient] = useState<any>(null);
  const [notesClient, setNotesClient] = useState<any>(null);
  const [clientNoteText, setClientNoteText] = useState('');
  const [viewReport, setViewReport] = useState<any>(null);

  useEffect(() => {
    fetchClientsAndReports();
  }, []);

  const fetchClientsAndReports = async () => {
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([
        api.get('/clients', { limit: 100 }),
        api.get('/deal-reports'),
      ]);
      if (cRes.success) setClients(cRes.data || []);
      if (dRes.success) setDealReports(dRes.data || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCloseDeal = (client: any) => {
    setClosingModalClient(client);
  };

  const handleCloseDealSuccess = () => {
    fetchClientsAndReports();
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesClient) return;
    try {
      await api.put(`/clients/${notesClient.id}`, { notes: clientNoteText });
      setClients((prev) =>
        prev.map((c) => (c.id === notesClient.id ? { ...c, notes: clientNoteText } : c))
      );
      setNotesClient(null);
    } catch (err) {
      alert('Failed to update notes');
    }
  };

  // Extract unique areas
  const areas = Array.from(
    new Set(clients.map((c) => c.location).filter(Boolean))
  );

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.clientId?.toLowerCase().includes(search.toLowerCase());

    const matchesArea =
      selectedArea === 'ALL' || (c.location && c.location.includes(selectedArea));

    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Sleek Page Header (Clean & Modern) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clients Management & Deal Closing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage enterprise accounts, audit designation & territory details, and close deals with official reports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Client Directory ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('closingReports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'closingReports'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Deal Reports ({dealReports.length})
          </button>
        </div>
      </div>

      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Top Controls: Search & Area Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients by name, contact, area, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
                >
                  <option value="ALL">All Territories</option>
                  {areas.map((a, i) => (
                    <option key={i} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs font-extrabold text-slate-500">
              Showing <span className="text-purple-600">{filteredClients.length}</span> Clients
            </span>
          </div>

          {/* Clients List with Close Deal & Report Button */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-5">Client Organization & Contact</th>
                    <th className="py-4 px-5">Area & Contact Number</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Marketing Head Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredClients.map((client) => {
                    const isClosedWon = client.status === 'Closed Won' || client.status === 'WON';

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name along with designation */}
                        <td className="py-4 px-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-200/50 flex items-center justify-center text-purple-700 font-black text-sm shrink-0">
                              {client.name ? client.name[0] : 'C'}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block leading-tight text-sm">
                                {client.name}
                              </span>
                              <span className="text-[11px] font-bold text-purple-600 block mt-0.5">
                                {client.contactPerson} ({client.designation || 'Head of Procurement'})
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Industry: {client.industry}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Area and contact */}
                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            {client.location}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {client.phone}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                              isClosedWon
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {client.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* Small notes button */}
                            <button
                              onClick={() => {
                                setNotesClient(client);
                                setClientNoteText(client.notes || '');
                              }}
                              className="btn-smooth flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-amber-50 text-amber-800 font-bold text-[11px]"
                              title="Client notes"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Notes</span>
                            </button>

                            {/* Small view button */}
                            <button
                              onClick={() => setViewClient(client)}
                              className="btn-smooth flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-[11px]"
                              title="View client card"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            {/* MARKETING HEAD EXCLUSIVE: Close Deal & Generate Report */}
                            <button
                              onClick={() => handleOpenCloseDeal(client)}
                              className="btn-emerald flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[11px] shadow-sm shadow-emerald-500/20"
                              title="Close deal and generate official report"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Close Deal & Report</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED DEAL REPORTS TAB */}
      {activeTab === 'closingReports' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Official Deal Closing & Budget Reports
              </h3>
              <p className="text-xs text-slate-400">
                Generated by Marketing Head • Signed contracts reflected in company revenue ledger
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              {dealReports.length} Reports Generated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dealReports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {report.reportId}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                      {report.clientName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {report.contactPerson} • {report.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-700 block">
                      ₹ {Number(report.budgetAmount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {report.closedDate}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p>
                    <span className="font-bold text-slate-700">Scope:</span> {report.scopeOfWork}
                  </p>
                  <p>
                    <span className="font-bold text-slate-700">Milestones:</span> {report.paymentMilestones}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    Authorized By: <span className="font-bold text-slate-800">{report.closedByName}</span>
                  </span>
                  <button
                    onClick={() => {
                      setClosingModalClient({ name: report.clientName, ...report });
                    }}
                    className="btn-smooth flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEAL CLOSING REPORT MODAL */}
      <DealClosingReportModal
        client={closingModalClient}
        isOpen={!!closingModalClient}
        onClose={() => setClosingModalClient(null)}
        onSuccess={handleCloseDealSuccess}
      />

      {/* CLIENT NOTES MODAL */}
      {notesClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Notes for {notesClient.name}</h4>
              <button onClick={() => setNotesClient(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNotes} className="mt-4 space-y-3">
              <textarea
                rows={4}
                value={clientNoteText}
                onChange={(e) => setClientNoteText(e.target.value)}
                placeholder="Client preferences, history, negotiation notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNotesClient(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-smooth px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CLIENT CARD MODAL */}
      {viewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">{viewClient.name}</h4>
              <button onClick={() => setViewClient(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <p><span className="font-bold text-slate-700">Contact Person:</span> {viewClient.contactPerson} ({viewClient.designation || 'Manager'})</p>
                <p><span className="font-bold text-slate-700">Location:</span> {viewClient.location}</p>
                <p><span className="font-bold text-slate-700">Phone:</span> {viewClient.phone}</p>
                <p><span className="font-bold text-slate-700">Email:</span> {viewClient.email}</p>
                <p><span className="font-bold text-slate-700">Industry:</span> {viewClient.industry}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Requirement:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl text-slate-600">{viewClient.requirement || 'Standard CRM solution'}</p>
              </div>
              {viewClient.notes && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Notes:</span>
                  <p className="p-2.5 bg-amber-50 rounded-xl text-amber-950 italic">"{viewClient.notes}"</p>
                </div>
              )}
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewClient(null)}
                className="btn-smooth px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

