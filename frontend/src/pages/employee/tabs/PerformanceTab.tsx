import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api/client';
import { EmployeeAnalytics } from '../../../types';
import {
  TrendingUp,
  Award,
  IndianRupee,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const PerformanceTab: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EmployeeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get<{ success: boolean } & EmployeeAnalytics>(
        `/analytics/employee/${user?.id}?days=7`
      );
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    totalLeads: 0,
    totalApproached: 0,
    convertedLeads: 0,
    conversionRate: 0,
    meetingsCompleted: 0,
    totalMeetingDurationMinutes: 0,
    totalHoursInMeetings: 0,
    reportsSubmitted: 0,
    dealsWonCount: 0,
    totalRevenue: 0,
    pipelineValue: 0,
  };

  const chartData = data?.activityTrend || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Greeting */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
            <span>Welcome back, {user?.name || 'Executive'}</span>
            <span className="text-pink-500">✨</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your pipeline conversions, territory revenue, and daily meeting momentum.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-xl border border-pink-100 text-xs font-bold">
          <Flame className="w-4 h-4 text-pink-500" />
          <span>Active Streak</span>
        </div>
      </div>

      {/* Two Key Metric Cards (Exact Wireframe Top Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Success Rate (%) */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft flex items-center justify-between relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Success Rate (%)
            </span>
            <div className="text-3xl font-extrabold text-slate-800 flex items-baseline space-x-1.5">
              <span>{stats.conversionRate}%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Conversion</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.convertedLeads} converted out of {stats.totalLeads} total leads
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 shadow-xs shrink-0">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft flex items-center justify-between relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Won Revenue
            </span>
            <div className="text-3xl font-extrabold text-slate-800 flex items-baseline space-x-1">
              <span className="text-pink-500 font-bold text-xl">₹</span>
              <span>{Number(stats.totalRevenue).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              From {stats.dealsWonCount} closed deals • Active pipeline: ₹{Number(stats.pipelineValue).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <IndianRupee className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Clean Trend Line Chart */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">7-Day Meeting & Outreach Momentum</h3>
            <p className="text-xs text-slate-400">Completed client meetings and minutes logged</p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span className="text-slate-600">Meetings</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-slate-600">Minutes Logged</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F472B6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F472B6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCE7F3" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
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
              <Area type="monotone" dataKey="meetingsCount" stroke="#EC4899" strokeWidth={2.5} fillOpacity={1} fill="url(#pinkGrad)" name="Meetings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personal Progress Summary Below */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-pink-100/80 p-4 shadow-soft flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Meetings Completed</span>
            <div className="text-lg font-bold text-slate-800">{stats.meetingsCompleted}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100/80 p-4 shadow-soft flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Time in Client Meetings</span>
            <div className="text-lg font-bold text-slate-800">{stats.totalHoursInMeetings} hrs</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100/80 p-4 shadow-soft flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reports Submitted</span>
            <div className="text-lg font-bold text-slate-800">{stats.reportsSubmitted}</div>
          </div>
        </div>
      </div>

      {/* Won Deals Table */}
      {data?.wonDeals && data.wonDeals.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-100/80 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-pink-50">
            <h3 className="text-sm font-bold text-slate-800">Closed Won Contracts</h3>
          </div>
          <div className="divide-y divide-pink-50">
            {data.wonDeals.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{d.lead?.companyName || d.lead?.name}</div>
                  <div className="text-slate-400 text-[11px]">{d.lead?.name} • {d.lead?.area}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-600 text-sm">
                    ₹{Number(d.dealValue).toLocaleString('en-IN')}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Closed on {d.closedAt ? new Date(d.closedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

