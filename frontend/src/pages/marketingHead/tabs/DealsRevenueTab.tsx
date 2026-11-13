import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { Deal, DealStatus } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import confetti from 'canvas-confetti';
import {
  Search,
  IndianRupee,
  Calendar,
  Building2,
  User as UserIcon,
  Phone,
  Check,
  Edit2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const DealsRevenueTab: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Editing Deal Value inline
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    fetchDeals();
  }, [statusFilter]);

  const fetchDeals = async () => {
    try {
      const res = await api.get<{ success: boolean; deals: Deal[] }>('/deals', {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setDeals(res.deals || []);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeals();
  };

  const handleStatusChange = async (dealId: string, newStatus: DealStatus) => {
    try {
      const res = await api.patch<{ success: boolean; deal: Deal }>(`/deals/${dealId}`, {
        status: newStatus,
      });
      if (res.deal) {
        setDeals((prev) => prev.map((d) => (d.id === dealId ? res.deal : d)));

        // Celebrate if WON!
        if (newStatus === 'CLOSED_WON') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F472B6', '#EC4899', '#C4B5FD', '#6EE7B7'],
          });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update deal status.');
    }
  };

  const handleSaveDealValue = async (dealId: string) => {
    const num = parseFloat(editValue);
    if (isNaN(num)) return;

    try {
      const res = await api.patch<{ success: boolean; deal: Deal }>(`/deals/${dealId}`, {
        dealValue: num,
      });
      if (res.deal) {
        setDeals((prev) => prev.map((d) => (d.id === dealId ? res.deal : d)));
        setEditingDealId(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update value.');
    }
  };

  const totalWonRevenue = deals
    .filter((d) => d.status === 'CLOSED_WON')
    .reduce((sum, d) => sum + Number(d.dealValue || 0), 0);

  const totalPipelineRevenue = deals
    .filter((d) => d.status === 'PROPOSAL' || d.status === 'NEGOTIATION')
    .reduce((sum, d) => sum + Number(d.dealValue || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Won Revenue (Closed Contracts)
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              ₹{totalWonRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active In-Flight Pipeline
            </span>
            <div className="text-2xl font-extrabold text-pink-600 mt-1">
              ₹{totalPipelineRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals by client, company, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs bg-pink-50/20 border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 text-slate-700 font-semibold"
          >
            <option value="">All Deal Stages</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CLOSED_WON">Closed Won</option>
            <option value="CLOSED_LOST">Closed Lost</option>
          </select>
        </div>
      </div>

      {/* Clean Deals Table / List (Exact Wireframe Fields) */}
      <div className="bg-white rounded-2xl border border-pink-100/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-pink-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Deals & Pipeline Management ({deals.length})
          </h3>
          <span className="text-xs text-slate-400">Update stages and deal values live</span>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs font-semibold text-slate-500">No deals found</p>
            <p className="text-[11px] text-slate-400 mt-1">Leads scheduled for meetings automatically populate here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9FB] text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-pink-50">
                <tr>
                  <th className="py-3 px-4">Client / Assigned To</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Deal Status</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4 text-right">Deal Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-pink-50/30 transition-colors">
                    {/* Name: Client & Assigned Employee */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {deal.lead?.companyName || deal.lead?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <UserIcon className="w-3 h-3 text-pink-400" />
                        <span>Owner: {deal.owner?.name || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{deal.lead?.name}</div>
                      <div className="text-[11px] text-slate-400">{deal.lead?.contact}</div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={deal.status}
                        onChange={(e) => handleStatusChange(deal.id, e.target.value as DealStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          deal.status === 'CLOSED_WON'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : deal.status === 'CLOSED_LOST'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : deal.status === 'NEGOTIATION'
                            ? 'bg-pink-50 text-pink-700 border-pink-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        <option value="PROPOSAL">Proposal</option>
                        <option value="NEGOTIATION">Negotiation</option>
                        <option value="CLOSED_WON">Closed Won</option>
                        <option value="CLOSED_LOST">Closed Lost</option>
                      </select>
                    </td>

                    {/* Follow-up / Meeting Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {deal.nextFollowUpDate ? (
                        <div className="flex items-center space-x-1 text-[11px] font-semibold text-purple-700">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>{new Date(deal.nextFollowUpDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Deal Value */}
                    <td className="py-3.5 px-4 text-right">
                      {editingDealId === deal.id ? (
                        <div className="flex items-center justify-end space-x-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 px-2 py-1 text-xs rounded border border-pink-300 font-bold text-right"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveDealValue(deal.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingDealId(deal.id);
                            setEditValue(String(deal.dealValue));
                          }}
                          className="font-extrabold text-slate-800 text-sm hover:text-pink-600 cursor-pointer flex items-center justify-end space-x-1 group"
                          title="Click to edit value"
                        >
                          <span>₹{Number(deal.dealValue).toLocaleString('en-IN')}</span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400" />
                        </div>
                      )}
                    </td>
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

