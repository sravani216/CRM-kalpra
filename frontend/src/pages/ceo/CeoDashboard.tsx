import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ExecutiveAnalytics, User } from '../../types';
import {
  Shield,
  IndianRupee,
  Users2,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  Calendar,
  Filter,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/**
 * Reusable Circular Progress Ring for Middle Row KPI Gauges
 */
const CircularGauge: React.FC<{
  title: string;
  percentage: number;
  color: string;
  subtext: string;
}> = ({ title, percentage, color, subtext }) => {
  const cleanPct = Math.min(100, Math.max(0, Math.round(percentage)));
  const data = [
    { name: 'Progress', value: cleanPct },
    { name: 'Remaining', value: 100 - cleanPct },
  ];

  return (
    <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex flex-col items-center justify-between text-center relative">
      <h4 className="text-xs font-bold text-slate-700 tracking-tight">{title}</h4>

      <div className="relative w-40 h-40 my-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={68}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#FCE7F3" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {cleanPct}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Rate</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 font-medium">{subtext}</p>
    </div>
  );
};

export const CeoDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<ExecutiveAnalytics | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Top Selector Tab: Clients vs Revenue (Image 3 Wireframe Top Split)
  const [topActiveView, setTopActiveView] = useState<'clients' | 'revenue'>('revenue');

  useEffect(() => {
    fetchExecutiveData();
    fetchTeam();
  }, []);

  const fetchExecutiveData = async () => {
    try {
      const res = await api.get<{ success: boolean } & ExecutiveAnalytics>('/analytics/executive');
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to fetch executive analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await api.get<{ success: boolean; team: User[] }>('/users/team');
      setEmployees(res.team || []);
    } catch (err) {}
  };

  const overview = analytics?.overview || {
    totalClients: 0,
    totalLeads: 0,
    totalApproached: 0,
    totalMeetings: 0,
    totalRevenue: 0,
    overallConversionRate: 0,
    monthlyTarget: 3000000,
    targetProgressPercentage: 0,
  };

  const monthlyTrend = analytics?.monthlyRevenueAndLeadsTrend || [];
  const leaderboard = analytics?.employeeLeaderboard || [];

  // Gauge calculations
  const conversionPct = overview.overallConversionRate;
  const approachedMeetingPct =
    overview.totalApproached > 0
      ? Math.round((overview.totalMeetings / overview.totalApproached) * 100)
      : 0;
  const revenueTargetPct = overview.targetProgressPercentage;

  // Filter leaderboard if single employee selected
  const filteredLeaderboard =
    selectedEmployeeFilter === 'all'
      ? leaderboard
      : leaderboard.filter((e) => e.id === selectedEmployeeFilter);

  return (
    <div className="min-h-screen bg-[#FFF9FB] pb-12">
      {/* CEO Header with Strict Read-Only Pill */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-soft">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-slate-800">
                    Kalpra <span className="text-purple-600 font-bold">Executive</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    CEO Office
                  </span>
                </div>
              </div>

              {/* Subtle Live View • Read-Only Pill */}
              <div className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live View • Read-Only</span>
              </div>
            </div>

            {/* Team Filter Dropdown + Logout */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-purple-500" />
                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-pink-100 bg-pink-50/20 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-300"
                >
                  <option value="all">All Marketing Team</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Summary Tabs / Cards (Exact Wireframe Top Split) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Left: Clients Metric Card */}
          <div
            onClick={() => setTopActiveView('clients')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-soft flex items-center justify-between ${
              topActiveView === 'clients'
                ? 'bg-white border-pink-400 ring-2 ring-pink-300/40'
                : 'bg-white/80 border-pink-100 hover:bg-white'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Converted Clients
              </span>
              <div className="text-3xl font-extrabold text-slate-800">
                {overview.totalClients}{' '}
                <span className="text-xs font-semibold text-slate-400 font-normal">
                  / {overview.totalLeads} Total Leads
                </span>
              </div>
              <p className="text-xs text-pink-600 font-semibold mt-1">
                {overview.totalApproached} leads actively approached across regional territories
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-xs shrink-0">
              <Users2 className="w-7 h-7" />
            </div>
          </div>

          {/* Top Right: Revenue Metric Card */}
          <div
            onClick={() => setTopActiveView('revenue')}
            className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-soft flex items-center justify-between ${
              topActiveView === 'revenue'
                ? 'bg-white border-purple-400 ring-2 ring-purple-300/40'
                : 'bg-white/80 border-pink-100 hover:bg-white'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Company Closed Revenue
              </span>
              <div className="text-3xl font-extrabold text-emerald-600 flex items-baseline space-x-1">
                <span className="text-xl font-bold">₹</span>
                <span>{Number(overview.totalRevenue).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Win Rate: <strong className="text-slate-700">{overview.overallConversionRate}%</strong> • Monthly Target: ₹30,00,000
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <IndianRupee className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Middle Row: Three Circular KPI Gauges (Exact 3 Circles in Wireframe) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gauge 1: Lead Conversion Rate (%) */}
          <CircularGauge
            title="Lead Conversion Rate"
            percentage={conversionPct}
            color="#F472B6" // Soft rose/pink
            subtext={`${overview.totalClients} of ${overview.totalLeads} leads closed`}
          />

          {/* Gauge 2: Approached vs Meetings (%) */}
          <CircularGauge
            title="Meeting Execution Rate"
            percentage={approachedMeetingPct}
            color="#C4B5FD" // Soft lavender
            subtext={`${overview.totalMeetings} meetings from ${overview.totalApproached} approached`}
          />

          {/* Gauge 3: Revenue Target Progress (%) */}
          <CircularGauge
            title="Monthly Target Progress"
            percentage={revenueTargetPct}
            color="#6EE7B7" // Mint
            subtext={`₹${Number(overview.totalRevenue).toLocaleString('en-IN')} of ₹30L goal`}
          />
        </div>

        {/* Bottom Section: Two Wide Clean Charts (Exact 2 Horizontal Panels in Wireframe) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Monthly Revenue & Client Acquisitions */}
          <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Monthly Revenue & Client Acquisitions
                </h3>
                <p className="text-xs text-slate-400">
                  Revenue progression and new leads added over the past 6 months
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="flex items-center space-x-1 text-pink-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span>Revenue (₹)</span>
                </span>
                <span className="flex items-center space-x-1 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span>Leads</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ceoRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F472B6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F472B6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCE7F3" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #FCE7F3',
                      boxShadow: '0 4px 20px -2px rgba(244, 114, 182, 0.1)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#EC4899" strokeWidth={2.5} fillOpacity={1} fill="url(#ceoRevGrad)" name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Employee Performance Comparison (Leads Approached vs Deals Closed) */}
          <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Employee Performance Comparison
                </h3>
                <p className="text-xs text-slate-400">
                  Leads assigned vs deals closed won per executive
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="flex items-center space-x-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span>Leads</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Won</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              {filteredLeaderboard.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No employee metrics found.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={filteredLeaderboard}
                    margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#FCE7F3" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #FCE7F3',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="leadsCount" fill="#FCE7F3" radius={[0, 6, 6, 0]} name="Leads Assigned" />
                    <Bar dataKey="dealsWonCount" fill="#6EE7B7" radius={[0, 6, 6, 0]} name="Deals Won" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

