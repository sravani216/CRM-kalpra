import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  Kanban,
  CheckSquare,
  CalendarClock,
  BarChart3,
  FileText,
  MapPin,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  // Filter navigation items by role
  const navigationItems = [
    {
      group: 'Overview',
      items: [
        {
          name: 'Dashboard',
          path: '/',
          icon: LayoutDashboard,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
      ]
    },
    {
      group: 'CRM & Sales',
      items: [
        {
          name: 'Clients',
          path: '/clients',
          icon: Users,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Lead Management',
          path: '/leads',
          icon: Target,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Sales Pipeline',
          path: '/pipeline',
          icon: Kanban,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
      ]
    },
    {
      group: 'Work & Field',
      items: [
        {
          name: 'Task Management',
          path: '/tasks',
          icon: CheckSquare,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Follow-ups',
          path: '/followups',
          icon: CalendarClock,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Field Tracking',
          path: '/tracking',
          icon: MapPin,
          roles: ['CEO', 'MANAGER', 'EMPLOYEE'],
        },
      ]
    },
    {
      group: 'Analytics & Management',
      items: [
        {
          name: 'Performance',
          path: '/analytics',
          icon: BarChart3,
          roles: ['CEO', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Reports & Exports',
          path: '/reports',
          icon: FileText,
          roles: ['CEO', 'ADMIN', 'MANAGER'],
        },
        {
          name: 'Notifications',
          path: '/notifications',
          icon: Bell,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
          roles: ['CEO', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
      ]
    }
  ];

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 shrink-0">
              K
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-800 leading-none">
                  Kalpra<span className="text-brand-500">CRM</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  Enterprise Suite
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

        {/* Navigation list */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navigationItems.map((group, groupIdx) => {
            const visibleItems = group.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {group.group}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group ${
                        isActive
                          ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm shadow-brand-500/5'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* User profile & Logout Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5 capitalize">
                  {user.role.toLowerCase()}
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

