import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Search,
  Bell,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface TopbarProps {
  isCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ isCollapsed }) => {
  const { user, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumb / title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', crumb: 'Home' };
    if (path.startsWith('/clients')) return { title: 'Client Management', crumb: 'Clients' };
    if (path.startsWith('/leads')) return { title: 'Lead Management', crumb: 'Leads' };
    if (path.startsWith('/pipeline')) return { title: 'Sales Pipeline', crumb: 'Pipeline' };
    if (path.startsWith('/tasks')) return { title: 'Task Management', crumb: 'Tasks' };
    if (path.startsWith('/followups')) return { title: 'Follow-up Center', crumb: 'Follow-ups' };
    if (path.startsWith('/analytics')) return { title: 'Performance Analytics', crumb: 'Analytics' };
    if (path.startsWith('/reports')) return { title: 'Reports & Exports', crumb: 'Reports' };
    if (path.startsWith('/tracking')) return { title: 'Field Employee Tracking', crumb: 'Field Check-in' };
    if (path.startsWith('/notifications')) return { title: 'Notifications', crumb: 'Notifications' };
    if (path.startsWith('/settings')) return { title: 'System Settings', crumb: 'Settings' };
    return { title: 'CRM Portal', crumb: 'Page' };
  };

  const { title, crumb } = getPageInfo();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRoleSwitch = async (email: string) => {
    setShowRoleSwitcher(false);
    await quickLogin(email);
    navigate('/');
  };

  const demoAccounts = [
    { name: 'Rajesh Varma', role: 'CEO', email: 'ceo@kalpracrm.com', desc: 'Org Monitoring & Revenue' },
    { name: 'Srija Mam', role: 'ADMIN', email: 'admin.srija@kalpracrm.com', desc: 'Acquisition & Lead Allocator' },
    { name: 'Arvind Kumar', role: 'MANAGER', email: 'manager@kalpracrm.com', desc: 'Task Approval & Workload' },
    { name: 'Shivani Reddy', role: 'EMPLOYEE', email: 'shivani@kalpracrm.com', desc: 'Sales Executive' },
    { name: 'Uday Kiran', role: 'EMPLOYEE', email: 'uday@kalpracrm.com', desc: 'Sales Specialist' },
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center justify-between h-full px-6 gap-4">
        {/* Title & Breadcrumb */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Kalpra CRM</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">{crumb}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, leads, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </form>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Button */}
          <div className="relative" ref={roleSwitcherRef}>
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200/80 text-brand-700 hover:bg-brand-100/70 transition-all shadow-sm"
              title="Switch demo user"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-extrabold">{user?.role}</span>
              <ChevronDown className="w-3 h-3 text-brand-500 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Quick Role Switcher</p>
                  <p className="text-[11px] text-slate-400">Switch user account with 1-click:</p>
                </div>
                <div className="py-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleRoleSwitch(acc.email)}
                      className={`w-full px-4 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                        user?.email === acc.email ? 'bg-brand-50/70' : ''
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{acc.name}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {acc.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{acc.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) {
                            setShowNotifications(false);
                            navigate(n.link);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-brand-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View all notifications &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 pl-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-200"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-400 capitalize mt-0.5">{user?.role?.toLowerCase()}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-50 text-brand-700 uppercase">
                    {user?.designation || user?.role}
                  </span>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> Profile & Security
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

