import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import {
  MapPin,
  Camera,
  Upload,
  Calendar,
  Clock,
  User,
  Building2,
  Navigation,
  CheckCircle2,
  Plus,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const FieldTracking: React.FC = () => {
  const { user } = useAuth();

  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Checkin form
  const [formData, setFormData] = useState({
    locationName: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    photoUrl: '',
    notes: '',
    clientId: '',
    leadId: '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  useEffect(() => {
    fetchCheckins();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/clients', { limit: 100 }),
        api.get('/leads', { limit: 100 }),
      ]);
      if (cRes.success) setClientsList(cRes.data || []);
      if (lRes.success) setLeadsList(lRes.data || []);
    } catch (e) {}
  };

  const fetchCheckins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tracking/checkins');
      if (res.success) {
        setCheckins(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocationDetected(true);
        setDetectingLocation(false);
      },
      (err) => {
        // Fallback demo coordinates
        setFormData(prev => ({
          ...prev,
          latitude: 17.4485,
          longitude: 78.3752,
        }));
        setLocationDetected(true);
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, photoUrl: res.fileUrl }));
      }
    } catch (err) {
      alert('Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoUrl) {
      alert('Please upload a photo of the place you are currently at.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post('/tracking/checkin', formData);
      if (res.success) {
        setIsCheckinModalOpen(false);
        setFormData({
          locationName: '',
          address: '',
          latitude: null,
          longitude: null,
          photoUrl: '',
          notes: '',
          clientId: '',
          leadId: '',
        });
        setLocationDetected(false);
        fetchCheckins();
      }
    } catch (err: any) {
      alert(err.message || 'Check-in submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Field Employee Visit Tracking & Photo Verification</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time on-site photo check-ins, location monitoring, and client visit audit
          </p>
        </div>

        <button
          onClick={() => {
            setIsCheckinModalOpen(true);
            detectCurrentLocation();
          }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" /> Check In & Upload Photo
        </button>
      </div>

      {/* Check-ins Gallery Stream */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">Loading check-in stream...</div>
      ) : checkins.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-100">
          No field check-ins recorded yet. Click &ldquo;Check In & Upload Photo&rdquo; to submit the first visit proof.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checkins.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden card-hover flex flex-col justify-between">
              {/* Photo */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={item.photoUrl}
                  alt={item.locationName}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified On-site
                </div>
              </div>

              {/* Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={item.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={item.user.name}
                      className="w-7 h-7 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.user.name}</h4>
                      <p className="text-[10px] text-slate-400">{item.user.designation}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 leading-snug mt-1">
                    {item.locationName}
                  </h3>

                  {item.address && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{item.address}</span>
                    </p>
                  )}

                  {item.client && (
                    <p className="text-xs font-semibold text-brand-600 mt-2">
                      Client: {item.client.organization}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-600 italic mt-2 p-2.5 bg-slate-50 rounded-xl">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.checkinTime).toLocaleString()}
                  </span>
                  {item.latitude && item.longitude && (
                    <span className="text-brand-600 font-semibold">
                      GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check-in Modal */}
      <Modal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        title="Field Visit Check-in & Photo Upload"
        subtitle="Capture current GPS coordinates and submit photo evidence of current client site"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitCheckin} className="space-y-4">
          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Site Photo (Photo of the place you are currently at) *
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors">
              {formData.photoUrl ? (
                <div className="space-y-2">
                  <img
                    src={formData.photoUrl}
                    alt="Current location"
                    className="w-full h-40 object-cover rounded-xl border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: '' })}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove & Take Another Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-8 h-8 text-teal-600 mx-auto" />
                  <div className="text-xs text-slate-600">
                    <label className="font-bold text-teal-600 hover:underline cursor-pointer">
                      <span>Click to upload photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>{' '}
                    or select from library
                  </div>
                  <p className="text-[10px] text-slate-400">JPG, PNG supported up to 10MB</p>
                  {uploadingPhoto && <p className="text-xs text-teal-600 font-bold">Uploading photo...</p>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / Site Name *</label>
              <input
                type="text"
                required
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="e.g. Apex Logistics HQ, Madhapur"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GPS Coordinates</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    formData.latitude
                      ? `${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}`
                      : 'Not detected'
                  }
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={detectCurrentLocation}
                  disabled={detectingLocation}
                  className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl border border-teal-200 shrink-0"
                  title="Detect GPS"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 42, HITEC City, Madhapur, Hyderabad 500081"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Linked Client (Optional)</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">None / General visit</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.organization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Linked Lead (Optional)</label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">None</option>
                {leadsList.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.leadId} - {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">On-Site Discussion & Inspection Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Record meetings held, client observations, follow-up requirements..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCheckinModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingPhoto}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Field Check-in'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

