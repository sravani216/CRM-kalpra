import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../api/client';
import {
  Camera,
  Lock,
  Palette,
  Check,
  User as UserIcon,
  Phone,
  Briefcase,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { user, refreshUser, updateUserInState } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Avatar Upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Personalization
  const [accentColor, setAccentColor] = useState(user?.preferences?.accentColor || '#F472B6');
  const [compactView, setCompactView] = useState(user?.preferences?.compactView || false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await api.patch('/users/profile', {
        name,
        designation,
        phone,
        bio,
      });
      if (res.user) {
        updateUserInState(res.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.upload<{ success: boolean; avatarUrl: string; user: any }>(
        '/users/profile/avatar',
        formData
      );
      if (res.user) {
        updateUserInState(res.user);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', error: true });
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/users/password', {
        currentPassword,
        newPassword,
      });
      setPasswordMsg({ text: 'Password updated successfully.', error: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to update password.', error: true });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateAccent = async (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--primary-accent', color);
    try {
      await api.patch('/users/profile', {
        preferences: {
          accentColor: color,
        },
      });
      refreshUser();
    } catch (err) {}
  };

  const handleToggleCompact = async (isCompact: boolean) => {
    setCompactView(isCompact);
    try {
      await api.patch('/users/profile', {
        preferences: {
          compactView: isCompact,
        },
      });
      refreshUser();
    } catch (err) {}
  };

  const colorSwatches = [
    { name: 'Baby Pink', value: '#F472B6', bg: 'bg-[#F472B6]' },
    { name: 'Lavender', value: '#C4B5FD', bg: 'bg-[#C4B5FD]' },
    { name: 'Mint', value: '#6EE7B7', bg: 'bg-[#6EE7B7]' },
    { name: 'Sky', value: '#BAE6FD', bg: 'bg-[#BAE6FD]' },
    { name: 'Rose Gold', value: '#FB7185', bg: 'bg-[#FB7185]' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Instagram-Style Profile Card */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-pink-50">
          {/* Circular Profile Photo with Upload Button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-pink-100 border-2 border-pink-300 overflow-hidden flex items-center justify-center font-bold text-2xl text-pink-600 shadow-soft">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md cursor-pointer transition-transform group-hover:scale-110"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          {/* Quick bio preview */}
          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <h2 className="text-lg font-extrabold text-slate-800">{user?.name}</h2>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{user?.designation || 'Marketing Professional'}</p>
            <p className="text-xs text-slate-400 mt-2 max-w-lg leading-relaxed">
              {user?.bio || 'Add a personal bio or motto below.'}
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleProfileSubmit} className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Status</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about your marketing specialization or territory focus..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Account & Security Section */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-pink-50 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Account Security & Password</h3>
            <p className="text-xs text-slate-400">Keep your account secure with regular updates</p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 ${
              passwordMsg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
          >
            {changingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Personalization Section */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-pink-50">
          <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Visual Personalization</h3>
            <p className="text-xs text-slate-400">Choose your workspace accent tone</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Accent Color Theme</label>
          <div className="flex items-center space-x-3">
            {colorSwatches.map((swatch) => (
              <button
                key={swatch.value}
                onClick={() => handleUpdateAccent(swatch.value)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  accentColor === swatch.value
                    ? 'border-slate-800 ring-2 ring-slate-800 bg-white'
                    : 'border-pink-100 bg-pink-50/30 hover:bg-pink-100'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${swatch.bg}`} />
                <span>{swatch.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between max-w-sm">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Compact View</span>
            <span className="text-[11px] text-slate-400">More dense layout for large displays</span>
          </div>
          <button
            onClick={() => handleToggleCompact(!compactView)}
            className={`w-11 h-6 rounded-full transition-colors p-1 ${
              compactView ? 'bg-pink-500' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                compactView ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

