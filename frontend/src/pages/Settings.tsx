import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  ShieldCheck,
  Lock,
  Database,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Account & System Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal credentials, view role permissions, and check system environment
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-100 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.designation} &bull; {user?.department}</p>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Permissions</span>
          <span className="font-bold text-slate-800">
            {user?.role === 'CEO' && 'Organization-wide Monitoring & Revenue Audit'}
            {user?.role === 'ADMIN' && 'Client Acquisition, Lead Generation & Allocation'}
            {user?.role === 'MANAGER' && 'Workload Assignment, Review & Field Oversight'}
            {user?.role === 'EMPLOYEE' && 'Lead Contact, Task Evidence & Field Check-in'}
          </span>
        </div>
      </div>

      {/* Security & Password Change */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-brand-500" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Change Account Password</h3>
            <p className="text-xs text-slate-400">Ensure strong cryptographic password protection</p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 mb-4 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* System Infrastructure Details */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-800">Connected Technology Stack</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Database</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">PostgreSQL 18.6 (Port 5433)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase">ORM</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Prisma 5.22 Relational</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Backend API</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Node.js Express REST (Port 5000)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Frontend UI</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">React + Vite + Tailwind</p>
          </div>
        </div>
      </div>
    </div>
  );
};

