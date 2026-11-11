import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('lead_conversion');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/generate', { type: reportType });
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(`http://localhost:5000/api/reports/generate?type=${reportType}&format=csv`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const REPORT_TYPES = [
    { key: 'lead_conversion', label: 'Lead Conversion & Pipeline Analysis' },
    { key: 'daily_work', label: 'Daily Employee Work & Interactions' },
    { key: 'employee_productivity', label: 'Employee Workload & Productivity Audit' },
    { key: 'revenue', label: 'Closed Won Deal & Realized Revenue' },
    { key: 'lost_leads', label: 'Lost & Inactive Leads Root-Cause Audit' },
  ];

  const records = reportData?.records || [];
  const summary = reportData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational & Analytics Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail reporting, pipeline health analytics, and executive exports
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF View
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.key}
            onClick={() => setReportType(r.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              reportType === r.key
                ? 'bg-brand-50 text-brand-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Report Document Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official CRM Audit Report</span>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">{reportData?.reportTitle}</h3>
            <p className="text-xs text-slate-400">
              Generated: {new Date(reportData?.generatedAt || Date.now()).toLocaleString()} &bull; Kalpra CRM Enterprise
            </p>
          </div>

          {/* Quick Metrics Summary */}
          {Object.keys(summary).length > 0 && (
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {Object.entries(summary).map(([key, val]: any) => (
                <div key={key} className="px-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {typeof val === 'number' && key.toLowerCase().includes('value') || key.toLowerCase().includes('revenue')
                      ? `₹${val.toLocaleString()}`
                      : val}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">Generating report data...</div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">No records available for this report type.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  {Object.keys(records[0]).map((h) => (
                    <th key={h} className="py-3 px-4">
                      {h.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {Object.values(row).map((val: any, valIdx: number) => (
                      <td key={valIdx} className="py-3 px-4 text-slate-700">
                        {typeof val === 'number' && val > 1000
                          ? `₹${val.toLocaleString()}`
                          : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

