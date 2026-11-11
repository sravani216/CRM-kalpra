import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  CalendarClock,
  Target,
  CheckSquare,
  FileCheck2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAD_ASSIGNED':
        return <Target className="w-5 h-5 text-indigo-500" />;
      case 'TASK_ASSIGNED':
        return <CheckSquare className="w-5 h-5 text-brand-500" />;
      case 'TASK_REVIEW':
      case 'TASK_APPROVED':
        return <FileCheck2 className="w-5 h-5 text-emerald-500" />;
      case 'FOLLOWUP_UPCOMING':
      case 'FOLLOWUP_OVERDUE':
        return <CalendarClock className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notification Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            System alerts, lead allocations, task approvals, and schedule reminders
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            No notifications to display.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-5 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.isRead ? 'bg-brand-50/20' : ''
              }`}
            >
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <span className="text-xs font-bold text-brand-600 hover:underline mt-2 inline-flex items-center gap-1">
                    Open associated module &rarr;
                  </span>
                )}
              </div>

              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

