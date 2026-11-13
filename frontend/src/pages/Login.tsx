import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'CEO') {
        navigate('/ceo');
      } else if (user.role === 'MARKETING_HEAD') {
        navigate('/marketing-head');
      } else {
        navigate('/employee');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Soft Brand Icon */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 items-center justify-center text-white shadow-soft-lg mb-4">
          <Sparkles className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Kalpra Marketing CRM
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Clean, Airy & Intuitive Work & Pipeline Management
        </p>

        {/* Demo Account Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setDemoUser('shivani@company.com')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-100/80 text-pink-700 hover:bg-pink-200 transition-colors border border-pink-200"
          >
            👤 Employee (Shivani)
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('head@company.com')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-700 hover:bg-rose-200 transition-colors border border-rose-200"
          >
            📊 Marketing Head
          </button>
          <button
            type="button"
            onClick={() => setDemoUser('ceo@company.com')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-700 hover:bg-purple-200 transition-colors border border-purple-200"
          >
            👑 CEO (Read-Only)
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-pink-100 shadow-soft">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-100 bg-pink-50/20 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-100 bg-pink-50/20 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-pink-200/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-pink-50 text-center">
            <span className="text-[11px] text-slate-400">
              Default demo password: <code className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded font-mono font-bold">Password@123</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

