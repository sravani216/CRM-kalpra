import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = (s: string) => {
    switch (s?.toUpperCase()) {
      case 'CONVERTED':
      case 'CLOSED_WON':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'IN_PROGRESS':
      case 'NEGOTIATION':
      case 'MEETING_SCHEDULED':
        return 'bg-pink-50 text-pink-700 border-pink-200';

      case 'FOLLOW_UP':
      case 'APPROACHED':
      case 'PROPOSAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      case 'NEW':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'LOST':
      case 'CLOSED_LOST':
      case 'MISSED':
        return 'bg-slate-100 text-slate-600 border-slate-200';

      case 'CLIENT_MEETING':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REPORT':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'GENERAL':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';

      default:
        return 'bg-pink-50 text-pink-700 border-pink-200';
    }
  };

  const formatText = (s: string) => {
    if (!s) return '';
    return s.replace(/_/g, ' ');
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border capitalize ${getStyle(
        status
      )} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};

