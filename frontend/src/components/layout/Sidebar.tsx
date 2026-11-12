import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  CalendarClock,
  TrendingUp,
  MapPin,
  Users,
  ShieldCheck,
  Building2,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Lock,
  Compass
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout, quickLogin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  // Exact Role-Based Modules strictly adhering to user instructions:
  // 1. Employee (5 Modules): User Dashboard, Lead Management, Task and Schedule, Progress Module, Field Tracking
  // 2. Admin / Marketing Head (3 Modules): The Dashboard, Clients Management, Team Management
  // 3. CEO: Single page without modules

  let navItems: { name: string; path: string; icon: any; badge?: string }[] = [];
  let moduleGroupName = 'Modules';

  if (role === 'EMPLOYEE') {
    moduleGroupName = 'Marketing Employee (5 Modules)';
    navItems = [
      { name: '1. User Dashboard', path: '/', icon: LayoutDashboard },
      { name: '2. Lead Management', path: '/leads', icon: Target },
      { name: '3. Task & Schedule', path: '/schedule', icon: CalendarClock },
      { name: '4. Progress Module', path: '/progress', icon: TrendingUp },
      { name: '5. Field Tracking', path: '/tracking', icon: MapPin },
    ];
  } else if (role === 'ADMIN' || role === 'MANAGER') {
    moduleGroupName = 'Marketing Head (3 Modules)';
    navItems = [
      { name: '1. The Dashboard', path: '/', icon: LayoutDashboard },
      { name: '2. Clients Management', path: '/clients', icon: Building2 },
      { name: '3. Team Management', path: '/team', icon: Users },
    ];
  } else if (role === 'CEO') {
    moduleGroupName = 'Executive Command Center';
    navItems = [
      { name: 'CEO Single-Page View', path: '/', icon: LayoutDashboard, badge: 'Read-Only' },
    ];
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white border-r border-slate-100 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 shrink-0">
              K
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                  Kalpra<span className="text-brand-600">Tech</span>
                </span>
                <span className="text-[10px] text-brand-600 font-extrabold tracking-wider uppercase mt-1">
                  Sales & Marketing CRM
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Role Banner */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Persona
              </span>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                  role === 'CEO'
                    ? 'bg-amber-100 text-amber-800'
                    : role === 'ADMIN' || role === 'MANAGER'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {role === 'CEO' ? 'CEO' : role === 'ADMIN' ? 'Marketing Head' : 'Marketing Employee'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="px-3 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="space-y-1.5">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                {moduleGroupName}
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white font-extrabold uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Persona Quick Switcher for testing */}
          {!isCollapsed && (
            <div className="pt-4 border-t border-slate-100">
              <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Role Preview
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => quickLogin('shivani@kalpracrm.com')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between transition-colors ${
                    role === 'EMPLOYEE'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>Marketing Employee</span>
                  <span className="text-[9px] font-mono text-slate-400">Shivani</span>
                </button>
                <button
                  onClick={() => quickLogin('admin.srija@kalpracrm.com')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between transition-colors ${
                    role === 'ADMIN' || role === 'MANAGER'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>Marketing Head</span>
                  <span className="text-[9px] font-mono text-slate-400">Srija Mam</span>
                </button>
                <button
                  onClick={() => quickLogin('ceo@kalpracrm.com')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between transition-colors ${
                    role === 'CEO'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>CEO (Executive)</span>
                  <span className="text-[9px] font-mono text-slate-400">Rajesh Varma</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User profile & Logout Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={
                user.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">
                  {role === 'CEO' ? 'Chief Executive' : role === 'ADMIN' ? 'Head of Marketing' : 'Sales & Marketing'}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
