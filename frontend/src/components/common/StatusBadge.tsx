import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'priority' | 'task' | 'followup' | 'role';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'lead', size = 'sm' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (type === 'lead') {
    switch (normalized) {
      case 'NEW':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        dotColor = 'bg-sky-500';
        break;
      case 'ASSIGNED':
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        dotColor = 'bg-indigo-500';
        break;
      case 'CONTACTED':
        colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
        dotColor = 'bg-teal-500';
        break;
      case 'INTERESTED':
        colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
        dotColor = 'bg-cyan-500';
        break;
      case 'DEMO_SCHEDULED':
        colorClasses = 'bg-violet-50 text-violet-700 border-violet-200';
        dotColor = 'bg-violet-500';
        break;
      case 'PROPOSAL_SENT':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        dotColor = 'bg-blue-500';
        break;
      case 'NEGOTIATION':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        dotColor = 'bg-amber-500';
        break;
      case 'WON':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
        dotColor = 'bg-emerald-500';
        break;
      case 'LOST':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        dotColor = 'bg-rose-500';
        break;
      case 'ON_HOLD':
        colorClasses = 'bg-amber-50/70 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-400';
        break;
    }
  } else if (type === 'priority') {
    switch (normalized) {
      case 'LOW':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
      case 'MEDIUM':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        dotColor = 'bg-sky-500';
        break;
      case 'HIGH':
        colorClasses = 'bg-orange-50 text-orange-700 border-orange-200 font-medium';
        dotColor = 'bg-orange-500';
        break;
      case 'URGENT':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
        dotColor = 'bg-rose-600 animate-pulse';
        break;
    }
  } else if (type === 'task') {
    switch (normalized) {
      case 'NOT_STARTED':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
      case 'IN_PROGRESS':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        dotColor = 'bg-sky-500';
        break;
      case 'PENDING_REVIEW':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
        dotColor = 'bg-purple-500';
        break;
      case 'COMPLETED':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
        dotColor = 'bg-emerald-500';
        break;
      case 'OVERDUE':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
        dotColor = 'bg-rose-600';
        break;
      case 'BLOCKED':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        break;
    }
  } else if (type === 'followup') {
    switch (normalized) {
      case 'SCHEDULED':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        dotColor = 'bg-blue-500';
        break;
      case 'COMPLETED':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500';
        break;
      case 'MISSED':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-500';
        break;
      case 'CANCELLED':
        colorClasses = 'bg-slate-100 text-slate-500 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
    }
  } else if (type === 'role') {
    switch (normalized) {
      case 'CEO':
        colorClasses = 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
        dotColor = 'bg-purple-600';
        break;
      case 'ADMIN':
        colorClasses = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
        dotColor = 'bg-blue-600';
        break;
      case 'MANAGER':
        colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
        dotColor = 'bg-emerald-600';
        break;
      case 'EMPLOYEE':
        colorClasses = 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
        dotColor = 'bg-teal-600';
        break;
    }
  }

  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors ${
        size === 'sm' ? 'text-xs' : 'text-sm px-3 py-1'
      } ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{label.toLowerCase()}</span>
    </span>
  );
};

