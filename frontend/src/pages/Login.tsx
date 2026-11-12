import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users2,
  TrendingUp,
  MapPin,
  Compass,
  CheckCircle2,
  Layers,
  Briefcase
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setError('');
    setIsLoading(true);
    try {
      await quickLogin(demoEmail);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Quick sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean, professional role accounts without personal names (Image 1 fix)
  const roleAccounts = [
    {
      roleTitle: 'Marketing Employee',
      badge: 'Sales & Field Portal',
      description: 'Tasks, client meetings, follow-ups, reports & leads',
      email: 'employee@kalpracrm.com',
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Users2,
    },
    {
      roleTitle: 'Marketing Head',
      badge: 'Admin Management',
      description: 'Team management, deal closing reports & performance',
      email: 'admin@kalpracrm.com',
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Briefcase,
    },
    {
      roleTitle: 'Chief Executive Officer',
      badge: 'Executive Command',
      description: 'Unified overview of revenue, budget closed & live tracking',
      email: 'ceo@kalpracrm.com',
      color: 'from-amber-500 to-brand-600',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient glowing radial effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Creative Brand & Value Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10">
          <div>
            {/* Brand Emblem */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-brand-500/30 border border-white/20">
                K
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">Kalpra Tech</h1>
                <p className="text-xs text-brand-300 font-semibold tracking-wide">Internal Sales & Marketing CRM</p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mt-10 space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30">
                Enterprise Operations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug text-white">
                Intelligent Client Acquisition & Team Coordination
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                A unified workspace for marketing executives, departmental leadership, and executive oversight.
              </p>
            </div>

            {/* Creative feature chips with hover effect */}
            <div className="mt-8 space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/40 hover:bg-white/10 transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Field Tracking & Photo Verification</h4>
                  <p className="text-[11px] text-slate-400">Live GPS tracking and visual check-in audits</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-white/10 transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Deal Closing Reports & Milestones</h4>
                  <p className="text-[11px] text-slate-400">Structured budget reconciliation and reporting</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/40 hover:bg-white/10 transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Executive Command Center</h4>
                  <p className="text-[11px] text-slate-400">Real-time revenue telemetry with zero redundancy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Kalpra Technologies Internal Portal</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure Network
            </span>
          </div>
        </div>

        {/* Right Side: Sleek Login Form & Role Access */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate with your organizational account or choose a direct role below
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Standard Credentials Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@kalpracrm.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-slate-600 font-semibold">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo default password is: password123')}
                  className="text-brand-600 hover:text-brand-700 font-bold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 btn-smooth disabled:opacity-50 mt-1 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Role Portal Access (NO Personal Names - Clean & Aesthetic) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Direct Role Access
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Click to enter workspace</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roleAccounts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickDemo(item.email)}
                    className="p-3 text-left rounded-2xl border border-slate-200/90 bg-white hover:border-brand-500 hover:bg-slate-50/80 transition-all duration-200 group hover-lift shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                      {item.roleTitle}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
