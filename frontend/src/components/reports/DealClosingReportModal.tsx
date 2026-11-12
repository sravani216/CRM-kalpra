import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  FileCheck2,
  Printer,
  Download,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DealClosingReportModalProps {
  client: any;
  lead?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DealClosingReportModal: React.FC<DealClosingReportModalProps> = ({
  client,
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    dealTitle: lead?.requirement
      ? `Enterprise Contract: ${lead.requirement.slice(0, 45)}`
      : `Enterprise CRM Agreement with ${client?.name || 'Client'}`,
    budgetAmount: lead?.dealValue || 750000,
    closedDate: new Date().toISOString().split('T')[0],
    paymentMilestones: '50% Advance on signing, 30% on UAT deployment, 20% on Annual Go-Live certification.',
    scopeOfWork: lead?.requirement || 'Complete deployment of Kalpra CRM, user training, and API integrations.',
    wonReason: 'High customer satisfaction during live demonstration and specialized local tech support SLA.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/deal-reports', {
        clientId: client.id,
        leadId: lead?.id,
        clientName: client.name,
        organization: client.organization || client.name,
        contactPerson: client.contactPerson,
        contactDesignation: client.designation || 'Head of Procurement',
        area: client.location || 'Hyderabad',
        ...form,
      });

      if (res.success && res.data) {
        setGeneratedReport(res.data);
        onSuccess();
      }
    } catch (err) {
      alert('Failed to close deal and generate report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {generatedReport ? 'Deal Closing Report Generated' : 'Close Deal & Generate Report'}
              </h3>
              <p className="text-xs text-slate-400">
                Marketing Head Deal Sign-Off • {client.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View mode: Form or Generated Certificate */}
        {!generatedReport ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Client Organization</span>
                <h4 className="text-sm font-extrabold text-slate-800">{client.name}</h4>
                <p className="text-xs text-slate-500">
                  {client.contactPerson} • {client.location}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Closing Stage
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Deal Title *</label>
              <input
                type="text"
                required
                value={form.dealTitle}
                onChange={(e) => setForm({ ...form, dealTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Closed Budget (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={10000}
                    value={form.budgetAmount}
                    onChange={(e) => setForm({ ...form, budgetAmount: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Closing Date</label>
                <input
                  type="date"
                  required
                  value={form.closedDate}
                  onChange={(e) => setForm({ ...form, closedDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Milestones Breakdown *
              </label>
              <textarea
                rows={2}
                required
                value={form.paymentMilestones}
                onChange={(e) => setForm({ ...form, paymentMilestones: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scope of Work & Deliverables *
              </label>
              <textarea
                rows={2}
                required
                value={form.scopeOfWork}
                onChange={(e) => setForm({ ...form, scopeOfWork: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Won Factor / Success Reason
              </label>
              <input
                type="text"
                value={form.wonReason}
                onChange={(e) => setForm({ ...form, wonReason: e.target.value })}
                placeholder="e.g. Prompt customer support SLA, competitive pricing..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-emerald flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <span>Generating Report...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Close & Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Report Document Preview */
          <div className="mt-5 space-y-5">
            <div
              id="printableDealReport"
              className="p-6 bg-slate-50 rounded-2xl border-2 border-emerald-500/30 text-slate-800 space-y-4"
            >
              {/* Report Header */}
              <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                      K
                    </span>
                    <span className="text-base font-black tracking-tight text-slate-900">
                      Kalpra Tech CRM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Official Deal Closing & Budget Authorization Report
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {generatedReport.reportId}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Date: {generatedReport.closedDate}
                  </p>
                </div>
              </div>

              {/* Client & Budget Specs */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Account Organization
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {generatedReport.clientName}
                  </span>
                  <p className="text-slate-600">
                    {generatedReport.contactPerson} ({generatedReport.contactDesignation})
                  </p>
                  <p className="text-slate-500">{generatedReport.area}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Total Contract Budget
                  </span>
                  <span className="text-xl font-extrabold text-emerald-700 block">
                    ₹ {Number(generatedReport.budgetAmount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Status: Deal Won & Authorized
                  </span>
                </div>
              </div>

              {/* Deal Details */}
              <div className="text-xs space-y-2 border-t border-slate-200 pt-3">
                <div>
                  <span className="font-bold text-slate-700">Deal Title:</span>{' '}
                  <span className="text-slate-800 font-semibold">{generatedReport.dealTitle}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Payment Milestones:</span>{' '}
                  <span className="text-slate-600">{generatedReport.paymentMilestones}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Scope of Work:</span>{' '}
                  <span className="text-slate-600">{generatedReport.scopeOfWork}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Won Reason:</span>{' '}
                  <span className="text-slate-600">{generatedReport.wonReason}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[9px]">Closed & Signed By</p>
                  <p className="font-bold text-slate-900 mt-1">{generatedReport.closedByName}</p>
                  <p className="text-slate-500">Head of Marketing & Sales, Kalpra Tech</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase font-bold text-[9px]">CEO Verification</p>
                  <p className="font-bold text-emerald-700 mt-1">● Confirmed in System Ledger</p>
                  <p className="text-slate-500">Reflected in CEO Dashboard Revenue</p>
                </div>
              </div>
            </div>

            {/* Print & Download buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Deal added to Company Revenue ledger
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-smooth flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={onClose}
                  className="btn-smooth px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
