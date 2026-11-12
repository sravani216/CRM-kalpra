import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarClock,
  Users2,
  PhoneCall,
  FileUp,
  Play,
  Square,
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Building2,
  Sparkles,
  ChevronRight,
  AlertCircle,
  FileText,
  X,
  IndianRupee,
  Check,
  Send,
  Eye
} from 'lucide-react';

export const TaskAndSchedule: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'meetings';

  const [activeBox, setActiveBox] = useState<'meetings' | 'followups' | 'reports'>(
    initialTab === 'reports' ? 'reports' : initialTab === 'followups' ? 'followups' : 'meetings'
  );

  // Box 1: Meetings State
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
  const timerIntervalRef = useRef<any>(null);

  // Photo Upload Modal
  const [photoModalMeeting, setPhotoModalMeeting] = useState<any>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Box 2: Follow Ups State
  const [followups, setFollowups] = useState<any[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(true);
  const [customStatusInput, setCustomStatusInput] = useState<Record<string, string>>({});

  // Box 3: Reports State
  const [workReports, setWorkReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: `Daily Work Status Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    summary: '',
    meetingsConducted: 2,
    leadsContacted: 5,
    dealsProgressed: 1,
    revenueInfluenced: 350000,
    challenges: '',
    attachmentName: 'Daily_Work_Log.pdf',
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [viewReport, setViewReport] = useState<any>(null);

  useEffect(() => {
    fetchMeetings();
    fetchFollowups();
    fetchReports();
  }, []);

  // Timer loop for active meetings
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setActiveTimers((prev) => {
        const next = { ...prev };
        meetings.forEach((m) => {
          if (m.status === 'IN_MEETING' && m.meetingStartTime) {
            const elapsedSeconds = Math.floor(
              (Date.now() - new Date(m.meetingStartTime).getTime()) / 1000
            );
            next[m.id] = Math.max(0, elapsedSeconds);
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [meetings]);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const res = await api.get('/client-meetings');
      if (res.success && res.data) {
        setMeetings(res.data);
      }
    } catch (e) {
    } finally {
      setLoadingMeetings(false);
    }
  };

  const fetchFollowups = async () => {
    setLoadingFollowups(true);
    try {
      const res = await api.get('/followups');
      if (res.success && res.data) {
        setFollowups(res.data);
      }
    } catch (e) {
    } finally {
      setLoadingFollowups(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get('/work-reports');
      if (res.success && res.data) {
        setWorkReports(res.data);
      }
    } catch (e) {
    } finally {
      setLoadingReports(false);
    }
  };

  // Start Meeting Handler
  const handleStartMeeting = async (meetingId: string) => {
    try {
      const res = await api.post(`/client-meetings/${meetingId}/start`);
      if (res.success) {
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meetingId
              ? { ...m, status: 'IN_MEETING', meetingStartTime: new Date().toISOString() }
              : m
          )
        );
      }
    } catch (err) {
      alert('Failed to start meeting');
    }
  };

  // Stop Meeting Handler
  const handleStopMeeting = async (meetingId: string) => {
    const notes = prompt('Enter meeting outcome notes / client feedback:') || 'Meeting concluded successfully.';
    try {
      const res = await api.post(`/client-meetings/${meetingId}/stop`, {
        discussionNotes: notes,
        clientStatus: 'In Discussion',
      });
      if (res.success) {
        fetchMeetings();
      }
    } catch (err) {
      alert('Failed to stop meeting');
    }
  };

  // Upload Photo Handler
  const handleOpenPhotoUpload = (meeting: any) => {
    setPhotoModalMeeting(meeting);
    setPreviewPhotoUrl(meeting.photoUrl || '');
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoModalMeeting) return;
    setIsUploadingPhoto(true);
    try {
      const photoToSave =
        previewPhotoUrl ||
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80';

      const res = await api.post(`/client-meetings/${photoModalMeeting.id}/upload-photo`, {
        photoUrl: photoToSave,
      });

      if (res.success) {
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === photoModalMeeting.id ? { ...m, photoUrl: photoToSave } : m
          )
        );
        setPhotoModalMeeting(null);
      }
    } catch (err) {
      alert('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Follow-up status update
  const handleFollowupStatusChange = async (followupId: string, newStatus: string) => {
    const followup = followups.find((f) => f.id === followupId);
    if (!followup) return;

    const customText = newStatus === 'Other' ? customStatusInput[followupId] || 'Custom status' : '';

    try {
      await api.patch(`/followups/${followupId}/status`, {
        status: newStatus,
        customStatusText: customText,
      });

      setFollowups((prev) =>
        prev.map((f) =>
          f.id === followupId ? { ...f, status: newStatus, customStatusText: customText } : f
        )
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSaveCustomStatusText = async (followupId: string) => {
    const text = customStatusInput[followupId];
    if (!text) return;
    try {
      await api.patch(`/followups/${followupId}/status`, {
        status: 'Other',
        customStatusText: text,
      });
      setFollowups((prev) =>
        prev.map((f) =>
          f.id === followupId ? { ...f, status: 'Other', customStatusText: text } : f
        )
      );
      alert('Custom status updated successfully!');
    } catch (err) {}
  };

  // Submit Work Status Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.summary.trim()) return;

    setIsSubmittingReport(true);
    try {
      const res = await api.post('/work-reports', reportForm);
      if (res.success) {
        setIsReportModalOpen(false);
        setReportForm({
          title: `Daily Work Status Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          summary: '',
          meetingsConducted: 2,
          leadsContacted: 5,
          dealsProgressed: 1,
          revenueInfluenced: 350000,
          challenges: '',
          attachmentName: 'Daily_Work_Log.pdf',
        });
        fetchReports();
        alert('Work report uploaded successfully! It is now reflected on Admin and CEO dashboards.');
      }
    } catch (err) {
      alert('Failed to upload report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-7 rounded-3xl text-white shadow-lg shadow-indigo-500/15">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-200">
          Module 3 • Kalpra Tech CRM
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          Task and Schedule
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
          Coordinate client meetings with live start/stop timers & photo proof, log customer follow-up statuses, and upload work status reports reflecting on Admin and CEO Dashboards.
        </p>
      </div>

      {/* THE 3 PROMINENT BOXES: CLIENT MEETINGS | FOLLOW UPS | REPORTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Box 1: Client Meetings */}
        <div
          onClick={() => setActiveBox('meetings')}
          className={`p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 ${
            activeBox === 'meetings'
              ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20'
              : 'border-slate-100 bg-white hover:border-blue-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${
                activeBox === 'meetings'
                  ? 'bg-white/20 text-white backdrop-blur-md'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Users2 className="w-6 h-6" />
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                activeBox === 'meetings' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {meetings.length} Clients
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight mt-4">Client Meetings</h3>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              activeBox === 'meetings' ? 'text-blue-100' : 'text-slate-500'
            }`}
          >
            Start/Stop meeting timers, upload photo verification, and inspect client status.
          </p>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
              activeBox === 'meetings' ? 'border-white/20 text-white' : 'border-slate-100 text-blue-600'
            }`}
          >
            <span>Open Client Meetings</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Box 2: Follow Ups */}
        <div
          onClick={() => setActiveBox('followups')}
          className={`p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 ${
            activeBox === 'followups'
              ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/20'
              : 'border-slate-100 bg-white hover:border-purple-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${
                activeBox === 'followups'
                  ? 'bg-white/20 text-white backdrop-blur-md'
                  : 'bg-purple-50 text-purple-600'
              }`}
            >
              <PhoneCall className="w-6 h-6" />
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                activeBox === 'followups'
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {followups.length} Calls
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight mt-4">Follow Ups</h3>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              activeBox === 'followups' ? 'text-purple-100' : 'text-slate-500'
            }`}
          >
            Review client interests, update 5+ statuses or type custom other notes.
          </p>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
              activeBox === 'followups'
                ? 'border-white/20 text-white'
                : 'border-slate-100 text-purple-600'
            }`}
          >
            <span>Open Follow Ups</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Box 3: Reports */}
        <div
          onClick={() => setActiveBox('reports')}
          className={`p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 ${
            activeBox === 'reports'
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
              : 'border-slate-100 bg-white hover:border-emerald-300 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${
                activeBox === 'reports'
                  ? 'bg-white/20 text-white backdrop-blur-md'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <FileUp className="w-6 h-6" />
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                activeBox === 'reports'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {workReports.length} Submitted
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight mt-4">Reports</h3>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              activeBox === 'reports' ? 'text-emerald-100' : 'text-slate-500'
            }`}
          >
            Upload daily work reports that reflect in Admin & CEO Dashboards in real time.
          </p>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
              activeBox === 'reports'
                ? 'border-white/20 text-white'
                : 'border-slate-100 text-emerald-600'
            }`}
          >
            <span>Upload & View Reports</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* CONTENT OF BOX 1: CLIENT MEETINGS */}
      {activeBox === 'meetings' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Client Meetings Directory</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                  Live Timing & Photo Audit
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact required categories: Name of person & designation • Company name • Area & contact • Start/Stop meeting • Upload photo • Status of the client
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                {meetings.filter((m) => m.status === 'IN_MEETING').length > 0 && (
                  <span className="flex items-center gap-1.5 text-rose-600 animate-pulse font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    Meeting In Progress
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Table with EXACT Categories Requested */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-4">Name of person & designation</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Area & Contact</th>
                  <th className="py-3.5 px-4">Start / Stop Meeting</th>
                  <th className="py-3.5 px-4">Upload Photo</th>
                  <th className="py-3.5 px-4">Status of Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {meetings.map((m) => {
                  const isInMeeting = m.status === 'IN_MEETING';
                  const isCompleted = m.status === 'COMPLETED';
                  const timerSeconds = activeTimers[m.id] || 0;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name of person and designation */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            {m.contactPerson ? m.contactPerson[0] : 'C'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-tight">
                              {m.contactPerson}
                            </span>
                            <span className="text-[11px] font-bold text-blue-600 block mt-0.5">
                              {m.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company name */}
                      <td className="py-4 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{m.companyName}</span>
                        </div>
                      </td>

                      {/* Area and contact */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="text-slate-700 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            {m.area}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {m.contactNumber}
                          </span>
                        </div>
                      </td>

                      {/* Start meeting / stop meeting */}
                      <td className="py-4 px-4">
                        {isInMeeting ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStopMeeting(m.id)}
                              className="btn-rose flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] shadow-sm shadow-rose-500/20"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Stop Meeting ({formatTimer(timerSeconds)})</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartMeeting(m.id)}
                            className="btn-emerald flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-sm shadow-emerald-500/20"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Meeting</span>
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Completed • {m.durationMinutes || 45} mins
                          </span>
                        )}
                      </td>

                      {/* Upload photo */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {m.photoUrl ? (
                            <img
                              src={m.photoUrl}
                              alt="Meeting proof"
                              onClick={() => handleOpenPhotoUpload(m)}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 cursor-pointer hover:scale-110 transition-transform"
                              title="Click to view/change meeting photo"
                            />
                          ) : (
                            <button
                              onClick={() => handleOpenPhotoUpload(m)}
                              className="btn-smooth flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold"
                            >
                              <Camera className="w-3.5 h-3.5 text-blue-600" />
                              <span>Upload Photo</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status of the client */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                            m.clientStatus.includes('Won')
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : m.clientStatus.includes('Active')
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {m.clientStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT OF BOX 2: FOLLOW UPS */}
      {activeBox === 'followups' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Follow Ups Center</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-extrabold border border-purple-200">
                  Multiple Statuses + Custom "Other" Input
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact required categories: Name of client, designation, company name, area and contact, status dropdown with interested, not interested, 4-5 options and other text option.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-4">Name of client & designation</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Area & Contact</th>
                  <th className="py-3.5 px-4">Status & Custom Option</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {followups.map((f) => {
                  const isOther = f.status === 'Other';

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name of client & designation */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center shrink-0">
                            {f.clientName ? f.clientName[0] : 'F'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-tight">
                              {f.clientName}
                            </span>
                            <span className="text-[11px] font-bold text-purple-600 block mt-0.5">
                              {f.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company name */}
                      <td className="py-4 px-4 font-bold text-slate-800">
                        {f.companyName}
                      </td>

                      {/* Area and contact */}
                      <td className="py-4 px-4">
                        <span className="text-slate-700 font-semibold block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {f.area}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px] block mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {f.contact}
                        </span>
                      </td>

                      {/* Status Dropdown + Other Text Input Option */}
                      <td className="py-4 px-4">
                        <div className="space-y-2 max-w-xs">
                          <select
                            value={f.status}
                            onChange={(e) => handleFollowupStatusChange(f.id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 cursor-pointer"
                          >
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Demo Scheduled">Demo Scheduled</option>
                            <option value="Price Negotiation">Price Negotiation</option>
                            <option value="Call Back Later">Call Back Later</option>
                            <option value="Proposal Follow-up">Proposal Follow-up</option>
                            <option value="Other">Other (Write Custom Option)...</option>
                          </select>

                          {/* When "Other" is chosen, show input to write custom status */}
                          {isOther && (
                            <div className="flex items-center gap-1.5 animate-fade-in">
                              <input
                                type="text"
                                placeholder="Type custom client status..."
                                defaultValue={f.customStatusText || ''}
                                onChange={(e) =>
                                  setCustomStatusInput((prev) => ({
                                    ...prev,
                                    [f.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 px-2.5 py-1 text-xs border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500/20"
                              />
                              <button
                                onClick={() => handleSaveCustomStatusText(f.id)}
                                className="p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                                title="Save Custom Status"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {f.customStatusText && !isOther && (
                            <span className="text-[10px] text-purple-600 italic block">
                              Note: {f.customStatusText}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT OF BOX 3: REPORTS (Syncs to Admin Dashboard and CEO Dashboard) */}
      {activeBox === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Work Status Reports Upload</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ● Reflected to Admin & CEO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your work status reports. They immediately sync to the Marketing Head (Admin) and CEO Dashboards.
              </p>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn-emerald flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20"
            >
              <FileUp className="w-4 h-4" />
              <span>+ Upload New Work Report</span>
            </button>
          </div>

          {/* Submitted Reports Feed */}
          <div className="space-y-4">
            {workReports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/40 hover:bg-white transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        report.employeeAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={report.employeeName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{report.title}</h4>
                      <p className="text-xs text-slate-500">
                        Submitted by <span className="font-bold text-slate-700">{report.employeeName}</span> ({report.employeeDesignation}) • {report.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {report.reportId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        report.status === 'REVIEWED' || report.status === 'ACKNOWLEDGED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                  {report.summary}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Meetings Conducted</span>
                    <span className="text-sm font-extrabold text-blue-600">
                      {report.meetingsConducted} Sessions
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Leads Contacted</span>
                    <span className="text-sm font-extrabold text-purple-600">
                      {report.leadsContacted} Leads
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Deals Progressed</span>
                    <span className="text-sm font-extrabold text-amber-600">
                      {report.dealsProgressed} Accounts
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Revenue Influenced</span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      ₹ {Number(report.revenueInfluenced || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {report.adminRemarks && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-950 font-medium">
                    <span className="font-bold">Marketing Head Note ({report.reviewedBy}):</span> "{report.adminRemarks}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO UPLOAD / PREVIEW MODAL */}
      {photoModalMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-bold text-slate-900">Upload Meeting Photo Proof</h4>
              </div>
              <button
                onClick={() => setPhotoModalMeeting(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="mt-4 space-y-4">
              <div className="text-xs text-slate-500">
                Client: <span className="font-bold text-slate-800">{photoModalMeeting.companyName}</span> ({photoModalMeeting.contactPerson})
              </div>

              {/* Image Preview */}
              {previewPhotoUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-48">
                  <img
                    src={previewPhotoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo URL or Camera Capture
                </label>
                <input
                  type="text"
                  placeholder="Paste photo link or use default high-res capture"
                  value={previewPhotoUrl}
                  onChange={(e) => setPreviewPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              {/* Sample Presets */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1.5">
                  Or select realistic meeting capture photo:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Sample"
                      onClick={() => setPreviewPhotoUrl(url)}
                      className={`h-14 w-full rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                        previewPhotoUrl === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPhotoModalMeeting(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPhoto}
                  className="btn-smooth px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  {isUploadingPhoto ? 'Saving...' : 'Confirm Photo Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD WORK REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Work Status Report</h3>
                  <p className="text-xs text-slate-400">Syncs immediately to Admin and CEO</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Summary of Day's Work Status & Key Accomplishments *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the client meetings conducted, objections overcome, proposals presented, and contracts signed..."
                  value={reportForm.summary}
                  onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meetings Conducted
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.meetingsConducted}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        meetingsConducted: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Leads Contacted
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.leadsContacted}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        leadsContacted: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deals Progressed
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.dealsProgressed}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        dealsProgressed: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Revenue Influenced (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.revenueInfluenced}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        revenueInfluenced: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field Challenges / Action Items
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client requested 5% concession on multi-branch scanner licenses"
                  value={reportForm.challenges}
                  onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="btn-emerald flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReport ? 'Uploading...' : 'Submit Work Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

