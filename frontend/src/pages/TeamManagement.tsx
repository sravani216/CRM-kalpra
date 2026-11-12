import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoogleCalendar } from '../components/calendar/GoogleCalendar';
import { TodayTasksCard } from '../components/dashboard/TodayTasksCard';
import { PersonalNotes } from '../components/dashboard/PersonalNotes';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Eye,
  Plus,
  Camera,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  CheckSquare,
  Award,
  Sparkles,
  X,
  ExternalLink,
  Lock,
  Compass,
  Navigation,
  Clock,
  ArrowRight
} from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'team' | 'photos' | 'tracking'
  const [activeTab, setActiveTab] = useState<'team' | 'photos' | 'tracking'>('team');
  const [teamSearch, setTeamSearch] = useState('');

  // Modals
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [mirrorUser, setMirrorUser] = useState<any>(null); // For Read-only User Dashboard mirror
  const [assignLeadMember, setAssignLeadMember] = useState<any>(null);
  const [zoomPhoto, setZoomPhoto] = useState<any>(null);

  // Add Member Form
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Marketing & Sales Executive',
    department: 'Marketing & Sales',
    area: 'Hitec City, Hyderabad',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Add Lead for Member Form
  const [leadForm, setLeadForm] = useState({
    name: '',
    designation: 'VP Procurement',
    companyName: '',
    area: 'Hitec City, Hyderabad',
    contactNumber: '',
    requirement: '',
    expectedValue: 500000,
    priority: 'HIGH',
    notes: '',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const [teamRes, taskRes, leadRes, checkinRes, mtgRes, locRes] = await Promise.all([
        api.get('/auth/team'),
        api.get('/tasks'),
        api.get('/leads'),
        api.get('/tracking/checkins'),
        api.get('/client-meetings'),
        api.get('/tracking/locations'),
      ]);

      if (teamRes.success) setTeamMembers(teamRes.data || []);
      if (taskRes.success) setTasks(taskRes.data || []);
      if (leadRes.success) setLeads(leadRes.data || []);
      if (locRes.success) setLocations(locRes.data || []);

      // Aggregate all photos uploaded by employees for monitoring
      const allPhotos: any[] = [];
      (mtgRes.data || []).forEach((m: any) => {
        if (m.photoUrl) {
          allPhotos.push({
            id: m.id,
            photoUrl: m.photoUrl,
            employeeName: m.employeeName,
            clientName: m.companyName,
            contactPerson: m.contactPerson,
            area: m.area,
            timestamp: m.meetingStopTime || m.meetingStartTime || m.createdAt,
            type: 'Client Meeting Photo',
          });
        }
      });
      (checkinRes.data || []).forEach((c: any) => {
        if (c.photoUrl) {
          allPhotos.push({
            id: c.id,
            photoUrl: c.photoUrl,
            employeeName: c.user?.name || 'Employee',
            clientName: c.client?.name || c.locationName,
            area: c.locationName,
            timestamp: c.createdAt,
            type: 'Field Check-in Photo',
          });
        }
      });
      setPhotos(allPhotos);
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.email.trim()) return;
    setIsSubmittingMember(true);
    try {
      const res = await api.post('/team/add', memberForm);
      if (res.success) {
        setIsAddMemberModalOpen(false);
        setMemberForm({
          name: '',
          email: '',
          phone: '',
          designation: 'Marketing & Sales Executive',
          department: 'Marketing & Sales',
          area: 'Hitec City, Hyderabad',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        });
        fetchTeamData();
      }
    } catch (err) {
      alert('Failed to add team member');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleCreateLeadForMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignLeadMember || !leadForm.name.trim()) return;
    setIsSubmittingLead(true);
    try {
      const res = await api.post('/leads', {
        contactPerson: leadForm.name,
        name: leadForm.name,
        designation: leadForm.designation,
        companyName: leadForm.companyName || `${leadForm.name} Enterprises`,
        area: leadForm.area,
        contactNumber: leadForm.contactNumber,
        requirement: leadForm.requirement,
        dealValue: Number(leadForm.expectedValue),
        priority: leadForm.priority,
        notes: leadForm.notes,
        assignedToId: assignLeadMember.id,
        status: 'Interested',
      });
      if (res.success) {
        setAssignLeadMember(null);
        fetchTeamData();
        alert(`Lead successfully assigned to ${assignLeadMember.name}!`);
      }
    } catch (err) {
      alert('Failed to allocate lead');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sleek Page Header (Clean & Modern) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Team Management & Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add team members, monitor user tasks, mirror employee dashboards in read-only mode, and track field locations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Team Members ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Photo Monitoring ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Live Location ({locations.length})
          </button>
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="btn-smooth flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Team Member</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEAM MEMBERS LIST WITH TASKS & READ-ONLY DASHBOARD VIEW */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {/* Quick Search & Filter Bar */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search team members by name, role, area..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {teamMembers.filter((m) =>
                (m.name || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
                (m.designation || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
                (m.area || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
                (m.email || '').toLowerCase().includes(teamSearch.toLowerCase())
              ).length} Team Members
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teamMembers
              .filter((m) =>
                (m.name || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
                (m.designation || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
                (m.area || '').toLowerCase().includes(teamSearch.toLowerCase()) ||
                (m.email || '').toLowerCase().includes(teamSearch.toLowerCase())
              )
              .map((member) => {
              const memberTasks = tasks.filter((t) => t.assignedToId === member.id);
              const completedTasks = memberTasks.filter((t) => t.status === 'COMPLETED').length;
              const memberLeads = leads.filter((l) => l.assignedToId === member.id);
              const wonDeals = memberLeads.filter(
                (l) => l.status === 'Won' || l.status?.toLowerCase().includes('won')
              );

              return (
                <div
                  key={member.id}
                  className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Designation */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            member.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={member.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                        />
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                            {member.name}
                          </h3>
                          <span className="text-xs font-bold text-purple-600 block mt-0.5">
                            {member.designation || 'Marketing & Sales Executive'}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {member.department || 'Marketing & Sales'} • {member.area || 'Hyderabad'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                        {member.role}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {member.phone || '+91 98765 00000'}
                      </span>
                    </div>

                    {/* Task & Performance Counters */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Assigned Tasks
                        </span>
                        <span className="text-base font-black text-slate-900 block mt-0.5">
                          {memberTasks.length}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-bold">
                          {completedTasks} Done
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Active Leads
                        </span>
                        <span className="text-base font-black text-purple-600 block mt-0.5">
                          {memberLeads.length}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">In Pipeline</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Deals Won
                        </span>
                        <span className="text-base font-black text-emerald-600 block mt-0.5">
                          {wonDeals.length}
                        </span>
                        <span className="text-[9px] text-emerald-700 font-bold">Closed</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View User Dashboard (Read Only) & Add Lead */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {/* Add Lead for Team Member */}
                    <button
                      onClick={() => setAssignLeadMember(member)}
                      className="btn-smooth flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lead</span>
                    </button>

                    {/* View User Dashboard Button (Required: Reflects User Dashboard in READ-ONLY mode) */}
                    <button
                      onClick={() => setMirrorUser(member)}
                      className="btn-smooth flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View User Dashboard</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PHOTO MONITORING AUDIT GALLERY */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Employee Field & Meeting Photo Monitoring</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Supervisor Audit Feed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Photos uploaded by sales and marketing employees during on-site client meetings and field check-ins.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">{photos.length} Captured Photos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img
                    src={item.photoUrl}
                    alt={item.clientName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setZoomPhoto(item)}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md">
                    {item.type}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {item.clientName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Uploaded by <span className="font-bold text-purple-700">{item.employeeName}</span>
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {item.area}
                    </span>
                    <button
                      onClick={() => setZoomPhoto(item)}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Inspect Photo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE LOCATION TRACKING (Extra Feature) */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Live Marketing Employee Location Tracking
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                  ● Real-time GPS Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor current field territory coordinates, battery status, and last active check-in of each marketing employee.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {locations.map((loc, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={loc.avatar}
                      alt={loc.employeeName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{loc.employeeName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{loc.designation}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {loc.status}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Current Territory:</span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {loc.currentArea}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">GPS Coordinates:</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Last Active:</span>
                    <span className="font-bold text-slate-700">{loc.lastActive}</span>
                  </div>
                  {loc.currentClient && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">At Client Office:</span>
                      <span className="font-bold text-purple-700">{loc.currentClient}</span>
                    </div>
                  )}
                </div>

                {loc.lastPhotoUrl && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <img
                      src={loc.lastPhotoUrl}
                      alt="Last photo"
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Last Check-in Photo
                      </span>
                      <span className="font-bold text-slate-700">Verified on field</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER DASHBOARD READ-ONLY MIRROR MODAL (Requirement: "the users dashboard must reflect when they click the view button but the marketing head should not be given an acess to edit anything regarding the team members") */}
      {mirrorUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={mirrorUser.avatar}
                  alt={mirrorUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{mirrorUser.name}'s Dashboard Mirror</h3>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      <Lock className="w-3 h-3" /> Read-Only Mode (No Edit Access)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Viewing employee live calendar, today's works, and personal notes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMirrorUser(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only User Calendar */}
            <div>
              <GoogleCalendar
                userId={mirrorUser.id}
                readOnly={true}
                title={`${mirrorUser.name}'s Calendar & Reminders (Read-Only)`}
              />
            </div>

            {/* Read-Only Tasks & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <TodayTasksCard userId={mirrorUser.id} readOnly={true} />
              </div>
              <div className="lg:col-span-6">
                <PersonalNotes
                  userId={mirrorUser.id}
                  readOnly={true}
                  title={`${mirrorUser.name}'s Thoughts & Notes (Read-Only)`}
                  subtitle="Employee process notes visible for managerial alignment."
                />
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-200">
              <button
                onClick={() => setMirrorUser(null)}
                className="btn-smooth px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Dashboard Mirror
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEAM MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h4 className="text-base font-bold text-slate-900">Add New Team Member</h4>
              </div>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@kalpracrm.com"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 44332"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Area</label>
                  <input
                    type="text"
                    placeholder="Gachibowli, Hyderabad"
                    value={memberForm.area}
                    onChange={(e) => setMemberForm({ ...memberForm, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={memberForm.designation}
                  onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMember}
                  className="btn-smooth px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  {isSubmittingMember ? 'Adding...' : 'Confirm Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LEAD FOR TEAM MEMBER MODAL */}
      {assignLeadMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">Add Lead for {assignLeadMember.name}</h4>
                <p className="text-xs text-purple-600 font-bold">Assign new client lead directly</p>
              </div>
              <button onClick={() => setAssignLeadMember(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadForMember} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumanth Kumar"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Biotech"
                  value={leadForm.companyName}
                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 90000 00000"
                    value={leadForm.contactNumber}
                    onChange={(e) => setLeadForm({ ...leadForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Budget (₹)</label>
                  <input
                    type="number"
                    value={leadForm.expectedValue}
                    onChange={(e) => setLeadForm({ ...leadForm, expectedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.requirement}
                  onChange={(e) => setLeadForm({ ...leadForm, requirement: e.target.value })}
                  placeholder="Customer requirements and initial instructions for employee..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignLeadMember(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="btn-smooth px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  {isSubmittingLead ? 'Assigning...' : 'Assign Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO ZOOM MODAL */}
      {zoomPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-2xl w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{zoomPhoto.clientName}</h4>
                <p className="text-xs text-slate-400">
                  Uploaded by {zoomPhoto.employeeName} • {zoomPhoto.area}
                </p>
              </div>
              <button onClick={() => setZoomPhoto(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl overflow-hidden max-h-[500px]">
              <img src={zoomPhoto.photoUrl} alt="Inspection" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

