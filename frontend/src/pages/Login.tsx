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
  CheckCircle2
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
      setError(err.message || 'Login failed. Please check your credentials.');
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
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Marketing Employee (5 Modules)', name: 'Shivani Reddy', email: 'shivani@kalpracrm.com', badge: 'bg-emerald-100 text-emerald-800' },
    { role: 'Marketing Head (3 Modules)', name: 'Srija Mam', email: 'admin.srija@kalpracrm.com', badge: 'bg-purple-100 text-purple-800' },
    { role: 'CEO (Single Page Overview)', name: 'Rajesh Varma', email: 'ceo@kalpracrm.com', badge: 'bg-amber-100 text-amber-800' },
    { role: 'Marketing Employee', name: 'Uday Kiran', email: 'uday@kalpracrm.com', badge: 'bg-sky-100 text-sky-800' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-brand-50/40 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand presentation */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-brand-400/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/20">
                K
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Kalpra CRM</h1>
                <p className="text-xs text-brand-200">Marketing & Work Management</p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Powering Client Acquisition & Sales Performance
              </h2>
              <p className="text-sm text-brand-100 leading-relaxed">
                Seamlessly coordinate marketing teams, allocate client leads, monitor field tasks, and track conversion milestones.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 mt-8">
            <div className="flex items-center gap-2 text-xs text-brand-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Full PostgreSQL Database & Relational Audit Logging</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Role-Based Access for CEO, Admin, Manager & Staff</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Interactive Kanban Pipeline & Field Photo Check-in</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Welcome Back</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sign in with your organizational credentials to continue
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@kalpracrm.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className="text-slate-600 font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Default password for all demo accounts is: password123')}
                  className="text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1-Click Quick Demo Sign In
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemo(acc.email)}
                  className="p-2.5 text-left rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${acc.badge}`}>
                      {acc.role}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600">
                    {acc.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

