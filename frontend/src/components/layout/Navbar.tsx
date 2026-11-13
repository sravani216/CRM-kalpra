import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, tabs }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'CEO':
        return { label: 'CEO', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'MARKETING_HEAD':
        return { label: 'Marketing Head', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
      default:
        return { label: 'Employee', bg: 'bg-pink-100 text-pink-700 border-pink-200' };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Role Pill */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-xs shadow-pink-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-800 tracking-tight">
                  Kalpra <span className="text-pink-500 font-bold">CRM</span>
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${roleBadge.bg}`}
                >
                  {roleBadge.label}
                </span>
              </div>
            </div>

            {/* CEO Read-Only Badge */}
            {user?.role === 'CEO' && (
              <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                <Shield className="w-3 h-3 text-purple-500" />
                <span>Live View • Read-Only</span>
              </span>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-pink-100 text-pink-700 shadow-xs'
                      : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 pl-3 border-l border-pink-100">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 overflow-hidden flex items-center justify-center font-bold text-xs border border-pink-200">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user?.designation || user?.email}
                </div>
              </div>
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

        {/* Mobile Subnav */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-pink-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-slate-500 hover:text-pink-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

