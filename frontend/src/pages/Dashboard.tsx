import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Target,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  IndianRupee,
  Clock,
  PhoneCall,
  UserPlus,
  ArrowUpRight,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  XCircle,
  Sparkles,
  MapPin,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PASTEL_COLORS = ['#4f6ef7', '#20c997', '#845ef7', '#ff6b6b', '#339af0', '#fcc419'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Review modal state (for Manager)
  const [reviewTask, setReviewTask] = useState<any>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let endpoint = '/dashboard/employee';
      if (user.role === 'CEO') endpoint = '/dashboard/ceo';
      else if (user.role === 'ADMIN') endpoint = '/dashboard/admin';
      else if (user.role === 'MANAGER') endpoint = '/dashboard/manager';

      const res = await api.get(endpoint);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTask || !reviewRemarks.trim()) return;
    setIsSubmittingReview(true);
    try {
      await api.post(`/tasks/${reviewTask.id}/review`, {
        action: reviewAction,
        remarks: reviewRemarks.trim(),
      });
      setReviewTask(null);
      setReviewRemarks('');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render CEO Dashboard
  if (user?.role === 'CEO') {
    const summary = data?.summary || {};
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              CEO Organization Command Center
            </span>
            <h2 className="text-2xl font-black mt-2">Welcome, {user.name}</h2>
            <p className="text-xs text-brand-100 mt-1 max-w-xl">
              Real-time enterprise intelligence across client acquisition, sales pipelines, marketing employee performance and revenue conversion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 bg-white text-brand-700 rounded-xl font-bold text-xs shadow-sm hover:bg-brand-50 transition-colors"
            >
              Detailed Analytics &rarr;
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-brand-500/30 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-colors"
            >
              Export Reports
            </button>
          </div>
        </div>

        {/* Overdue Follow-ups Alert Banner if any */}
        {data?.overdueFollowUps?.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-800">
                  Attention: {data.overdueFollowUps.length} Client Follow-up(s) Overdue
                </p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Overdue interactions need immediate attention to maintain lead momentum.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/followups')}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
            >
              View Follow-ups &rarr;
            </button>
          </div>
        )}

        {/* 10 KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Clients</span>
              <Users className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{summary.totalClients}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Acquired organizations</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Leads</span>
              <Target className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{summary.totalLeads}</div>
            <div className="text-[11px] text-slate-500 mt-1">{summary.activeLeads} currently active</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deals Won</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{summary.convertedLeads}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Conversion rate: {summary.conversionRate}</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lost Leads</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{summary.lostLeads}</div>
            <div className="text-[11px] text-slate-400 mt-1">Documented reasons</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">
              INR {(summary.totalRevenue / 100000).toFixed(1)}L
            </div>
            <div className="text-[11px] text-slate-500 mt-1">₹{summary.totalRevenue?.toLocaleString()} INR</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Rev</span>
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-black text-brand-600">
              INR {(summary.monthlyRevenue / 100000).toFixed(1)}L
            </div>
            <div className="text-[11px] text-brand-600 font-semibold mt-1">Current month closed</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Tasks</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{summary.pendingTasks}</div>
            <div className="text-[11px] text-slate-500 mt-1">Assigned & review</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overdue Tasks</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">{summary.overdueTasks}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Missed deadlines</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sales Team</span>
              <Users className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{data?.employeeProductivity?.length || 2}</div>
            <div className="text-[11px] text-teal-600 font-semibold mt-1">Active executives</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Stages</span>
              <Target className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-600">10</div>
            <div className="text-[11px] text-slate-500 mt-1">End-to-end stages</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue & Deals Progress Chart */}
          <div className="lg:col-span-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Monthly Revenue & Performance Trend</h3>
                <p className="text-xs text-slate-400">Target vs Realized Revenue across months</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`INR ${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Actual Revenue (INR)" fill="#4f6ef7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" name="Monthly Target (INR)" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Source Breakdown Chart */}
          <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Lead Source Acquisition</h3>
              <p className="text-xs text-slate-400 mb-2">Where inbound clients originate</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.sourceAnalysis || []}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {(data?.sourceAnalysis || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {(data?.sourceAnalysis || []).slice(0, 4).map((s: any, idx: number) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PASTEL_COLORS[idx % PASTEL_COLORS.length] }} />
                    <span className="text-slate-600 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{s.count} leads</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Productivity Comparison Table */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Marketing & Sales Productivity Comparison</h3>
              <p className="text-xs text-slate-400">Head-to-head performance of Shivani Reddy vs Uday Kiran</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Open Comparison Matrix &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Leads Assigned</th>
                  <th className="py-3 px-4">Contacted</th>
                  <th className="py-3 px-4">Tasks Done</th>
                  <th className="py-3 px-4">Tasks Pending</th>
                  <th className="py-3 px-4">Deals Won</th>
                  <th className="py-3 px-4">Revenue Generated</th>
                  <th className="py-3 px-4">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(data?.employeeProductivity || []).map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-xl object-cover border" />
                      <span>{emp.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{emp.designation}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{emp.leadsAssigned}</td>
                    <td className="py-3.5 px-4 text-teal-700 font-semibold">{emp.leadsContacted}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-semibold">{emp.tasksCompleted}</td>
                    <td className="py-3.5 px-4 text-amber-700 font-semibold">{emp.tasksPending}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{emp.dealsWon}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      INR {emp.revenue?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px]">
                        {emp.conversionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-1">Company Activity Stream</h3>
          <p className="text-xs text-slate-400 mb-4">Latest client interactions, deal closures, and updates</p>
          <div className="space-y-3">
            {(data?.recentActivities || []).map((act: any) => (
              <div key={act.id} className="flex items-start gap-3 p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
                <img src={act.user.avatar} alt={act.user.name} className="w-8 h-8 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">
                      {act.user.name} <span className="font-normal text-slate-500">&bull; {act.title}</span>
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Lead: <span className="font-semibold">{act.lead.leadId}</span> - {act.lead.title}
                  </p>
                  {act.remarks && <p className="text-[11px] text-slate-500 italic mt-0.5">&ldquo;{act.remarks}&rdquo;</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard (Srija Mam)
  if (user?.role === 'ADMIN') {
    const summary = data?.summary || {};
    return (
      <div className="space-y-6">
        {/* Banner with Add Client & Add Lead Prompts */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-brand-600 to-indigo-700 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              Client Acquisition & Lead Allocation Portal
            </span>
            <h2 className="text-2xl font-black mt-2">Welcome, {user.name}</h2>
            <p className="text-xs text-brand-100 mt-1 max-w-xl">
              Register prospective client organizations, generate new leads, and allocate them to Shivani Reddy or Uday Kiran for immediate follow-up.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/clients')}
              className="px-4 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-xs shadow-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add New Client
            </button>
            <button
              onClick={() => navigate('/leads')}
              className="px-4 py-2.5 bg-blue-500/30 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Target className="w-4 h-4" /> Create Lead
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clients Acquired</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">{summary.totalClientsAcquired}</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">Total registered</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Leads Generated</span>
              <Target className="w-5 h-5 text-brand-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">{summary.totalLeadsGenerated}</div>
            <div className="text-xs text-slate-500 mt-1">Across all sectors</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Leads</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{summary.assignedLeadsCount}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Active with executives</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unassigned Leads</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600">{summary.unassignedLeadsCount}</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">Awaiting allocation</div>
          </div>
        </div>

        {/* Employee Lead Allocation Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data?.employeeAssignedMetrics || []).map((emp: any) => (
            <div key={emp.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-2xl object-cover border" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-xs text-slate-400">{emp.designation}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                  {emp.totalAssigned} Assigned
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Contacted</div>
                  <div className="text-lg font-bold text-teal-600 mt-0.5">{emp.contacted}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Uncontacted</div>
                  <div className="text-lg font-bold text-amber-600 mt-0.5">{emp.uncontacted}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Won</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{emp.won}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned Leads Allocation Table */}
        {data?.unassignedLeadsList?.length > 0 && (
          <div className="p-6 bg-amber-50/50 border border-amber-200/80 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-amber-900">Unassigned Leads Requiring Allocation</h4>
                <p className="text-xs text-amber-700">Assign these newly generated leads to Shivani or Uday</p>
              </div>
              <button
                onClick={() => navigate('/leads')}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                Go to Leads Manager &rarr;
              </button>
            </div>
            <div className="space-y-2">
              {data.unassignedLeadsList.map((lead: any) => (
                <div key={lead.id} className="p-3 bg-white rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{lead.leadId}: {lead.title}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{lead.client.organization} &bull; Expected: ₹{lead.expectedValue?.toLocaleString()} INR</p>
                  </div>
                  <button
                    onClick={() => navigate(`/leads`)}
                    className="px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                  >
                    Assign Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Client Registrations */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent Client Registrations</h3>
            <button
              onClick={() => navigate('/clients')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View All Clients &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Client ID</th>
                  <th className="py-2.5 px-4">Organization</th>
                  <th className="py-2.5 px-4">Contact Person</th>
                  <th className="py-2.5 px-4">Industry</th>
                  <th className="py-2.5 px-4">Leads Created</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentClients || []).map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-600">{c.clientId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.organization}</td>
                    <td className="py-3 px-4 text-slate-600">{c.contactPerson}</td>
                    <td className="py-3 px-4 text-slate-500">{c.industry}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{c.leads?.length || 0}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/clients`)}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render Manager Dashboard (Arvind Kumar)
  if (user?.role === 'MANAGER') {
    const summary = data?.summary || {};
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-700 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              Marketing Management & Task Review Command
            </span>
            <h2 className="text-2xl font-black mt-2">Welcome, {user.name}</h2>
            <p className="text-xs text-brand-100 mt-1 max-w-xl">
              Supervise marketing team workload, review and approve task completion evidence, assign deadlines, and monitor employee check-ins.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-white text-emerald-800 rounded-xl font-bold text-xs shadow-sm hover:bg-emerald-50 transition-colors"
            >
              Assign New Task &rarr;
            </button>
            <button
              onClick={() => navigate('/tracking')}
              className="px-4 py-2 bg-emerald-500/30 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-colors"
            >
              View Field Tracking
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Workload</span>
              <CheckSquare className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-800">{summary.totalTeamTasks}</div>
            <div className="text-xs text-slate-500 mt-1">Total active assignments</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
              <FileCheck2 className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-black text-purple-600">{summary.pendingApprovals}</div>
            <div className="text-xs text-purple-600 font-semibold mt-1">Awaiting your approval</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overdue Tasks</span>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-rose-600">{summary.overdueTasksCount}</div>
            <div className="text-xs text-rose-600 font-semibold mt-1">Delayed work</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unassigned Leads</span>
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600">{summary.unassignedLeadsCount}</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">Ready for re-allocation</div>
          </div>
        </div>

        {/* Pending Approvals Section (Tasks Submitted by Employees) */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Task Completion Submissions for Review</h3>
              <p className="text-xs text-slate-400">Review employee submitted evidence and approve or request rework</p>
            </div>
          </div>

          {data?.pendingApprovalTasks?.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
              No tasks currently pending your approval. All submissions reviewed!
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingApprovalTasks.map((t: any) => (
                <div key={t.id} className="p-4 bg-purple-50/40 border border-purple-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-900">{t.taskId}: {t.title}</span>
                      <StatusBadge status={t.priority} type="priority" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Submitted by <span className="font-bold">{t.assignedTo.name}</span> for {t.client?.name || 'General client'}
                    </p>
                    <div className="mt-2 p-2.5 bg-white rounded-xl border border-purple-100 text-xs text-slate-700">
                      <span className="font-semibold text-purple-900">Submitted Evidence:</span> {t.completionEvidence || 'Detailed in task attachments'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setReviewTask(t);
                        setReviewAction('APPROVE');
                        setReviewRemarks('Approved. Work verified and meets quality expectations.');
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setReviewTask(t);
                        setReviewAction('REJECT');
                        setReviewRemarks('Please review and provide additional documentation.');
                      }}
                      className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employee Workload Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data?.employeeWorkload || []).map((emp: any) => (
            <div key={emp.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-2xl object-cover border" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-xs text-slate-400">{emp.designation}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {emp.totalTasks} Total Tasks
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">In Progress</div>
                  <div className="text-base font-black text-sky-600 mt-0.5">{emp.inProgress}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Rev</div>
                  <div className="text-base font-black text-purple-600 mt-0.5">{emp.pendingReview}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Done</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">{emp.completed}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Overdue</div>
                  <div className="text-base font-black text-rose-600 mt-0.5">{emp.overdue}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Manager Review Modal */}
        {reviewTask && (
          <Modal
            isOpen={!!reviewTask}
            onClose={() => setReviewTask(null)}
            title={reviewAction === 'APPROVE' ? 'Approve Task Completion' : 'Reject Task / Request Rework'}
            subtitle={`Task: ${reviewTask.taskId} - ${reviewTask.title}`}
          >
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Manager Review Remarks</label>
                <textarea
                  rows={4}
                  required
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter feedback or instructions for the employee..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className={`px-4 py-2 text-xs font-bold rounded-xl text-white ${
                    reviewAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingReview ? 'Submitting...' : reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  // Render Employee Dashboard (Shivani / Uday)
  const summary = data?.summary || {};
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-600 via-brand-600 to-indigo-700 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
            Employee Workspace & Daily Work Queue
          </span>
          <h2 className="text-2xl font-black mt-2">Hello, {user?.name}</h2>
          <p className="text-xs text-brand-100 mt-1 max-w-xl">
            Here is your daily activity schedule, assigned client leads, follow-ups due today, and pending tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/tracking')}
            className="px-4 py-2.5 bg-white text-teal-800 rounded-xl font-bold text-xs shadow-md hover:bg-teal-50 transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-teal-600" /> Field Photo Check-in
          </button>
          <button
            onClick={() => navigate('/pipeline')}
            className="px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/20 transition-colors"
          >
            Open Pipeline
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">My Leads</div>
          <div className="text-2xl font-black text-slate-800">{summary.myAssignedLeadsCount}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">{summary.leadsContacted} contacted</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Interested Leads</div>
          <div className="text-2xl font-black text-cyan-600">{summary.interestedClients}</div>
          <div className="text-[11px] text-slate-500 mt-1">High conversion potential</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Due Today</div>
          <div className="text-2xl font-black text-brand-600">{summary.followUpsDueTodayCount}</div>
          <div className="text-[11px] text-brand-600 font-semibold mt-1">Follow-ups scheduled</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Overdue Follow-ups</div>
          <div className="text-2xl font-black text-rose-600">{summary.overdueFollowUpsCount}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Requires action</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tasks Pending</div>
          <div className="text-2xl font-black text-amber-600">{summary.tasksPendingCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">{summary.tasksCompletedCount} completed</div>
        </div>
      </div>

      {/* Due Today Follow-ups & My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Follow-ups Due Today</h3>
              <p className="text-xs text-slate-400">Scheduled client calls and meetings</p>
            </div>
            <button
              onClick={() => navigate('/followups')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View Calendar &rarr;
            </button>
          </div>

          {data?.followUpsToday?.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
              No follow-ups due today. You are all caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {data.followUpsToday.map((f: any) => (
                <div key={f.id} className="p-3.5 bg-brand-50/40 border border-brand-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{f.client.name}</span>
                    <p className="text-xs text-slate-500">{f.client.organization} &bull; {f.type}</p>
                    {f.discussionNotes && (
                      <p className="text-[11px] text-slate-600 mt-1 italic">&ldquo;{f.discussionNotes}&rdquo;</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/followups')}
                    className="px-3 py-1.5 text-xs font-bold text-brand-700 bg-white border border-brand-200 rounded-xl hover:bg-brand-50 transition-colors"
                  >
                    Action
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">My Assigned Tasks</h3>
              <p className="text-xs text-slate-400">Update progress or submit completion evidence</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View All Tasks &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {(data?.tasks || []).map((t: any) => (
              <div key={t.id} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{t.taskId}: {t.title}</span>
                    <StatusBadge status={t.status} type="task" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => navigate('/tasks')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

