import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { User, TaskSchedule, Lead, TaskType } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { Drawer } from '../../../components/common/Drawer';
import {
  UserPlus,
  Eye,
  PlusCircle,
  Users2,
  CalendarCheck,
  Award,
  IndianRupee,
  Phone,
  Mail,
  Camera,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  stats: {
    leadsCount: number;
    tasksCount: number;
    followUpsCount: number;
    dealsClosedCount: number;
    totalWonRevenue: number;
  };
}

export const TeamManagementTab: React.FC = () => {
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Member Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
    designation: 'Senior Marketing Executive',
    phone: '',
    bio: '',
  });
  const [addingMember, setAddingMember] = useState(false);

  // Assign Task Modal (+A)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState<TeamMemberItem | null>(null);
  const [assignedTask, setAssignedTask] = useState({
    title: '',
    type: 'CLIENT_MEETING' as TaskType,
    companyName: '',
    personName: '',
    contact: '',
    scheduledDate: new Date().toISOString().slice(0, 16),
  });
  const [assigning, setAssigning] = useState(false);

  // View Member Drawer (Eye)
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [inspectedEmployee, setInspectedEmployee] = useState<TeamMemberItem | null>(null);
  const [employeeTasks, setEmployeeTasks] = useState<TaskSchedule[]>([]);
  const [employeeLeads, setEmployeeLeads] = useState<Lead[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get<{ success: boolean; team: TeamMemberItem[] }>('/users/team');
      setTeam(res.team || []);
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const res = await api.post<{ success: boolean; user: any }>('/users/team', newMember);
      if (res.user) {
        setIsAddModalOpen(false);
        setNewMember({
          name: '',
          email: '',
          password: '',
          designation: 'Senior Marketing Executive',
          phone: '',
          bio: '',
        });
        fetchTeam();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployee) return;

    setAssigning(true);
    try {
      const res = await api.post<{ success: boolean; task: TaskSchedule }>('/tasks', {
        ...assignedTask,
        assignedToId: targetEmployee.id,
      });
      if (res.task) {
        setAssignModalOpen(false);
        setAssignedTask({
          title: '',
          type: 'CLIENT_MEETING',
          companyName: '',
          personName: '',
          contact: '',
          scheduledDate: new Date().toISOString().slice(0, 16),
        });
        alert(`Task successfully assigned to ${targetEmployee.name}!`);
        fetchTeam();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign task.');
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenInspect = async (member: TeamMemberItem) => {
    setInspectedEmployee(member);
    setViewDrawerOpen(true);
    setInspectLoading(true);

    try {
      const [tasksRes, leadsRes] = await Promise.all([
        api.get<{ success: boolean; tasks: TaskSchedule[] }>(`/tasks?employeeId=${member.id}`),
        api.get<{ success: boolean; leads: Lead[] }>(`/leads?employeeId=${member.id}`),
      ]);
      setEmployeeTasks(tasksRes.tasks || []);
      setEmployeeLeads(leadsRes.leads || []);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar with + Add Member Button */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-5 shadow-soft flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Marketing Team Roster</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor active work, delegate meetings, and inspect territory progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs shadow-pink-200 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Member</span>
        </button>
      </div>

      {/* Team List (Exact Wireframe Format) */}
      <div className="bg-white rounded-2xl border border-pink-100/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-pink-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Executives ({team.length})
          </span>
          <span className="text-xs text-slate-400">View performance or assign tasks (+A)</span>
        </div>

        {team.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs font-semibold text-slate-500">No marketing executives found.</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-50">
            {team.map((emp) => (
              <div
                key={emp.id}
                className="p-4 hover:bg-pink-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Employee Name & Profile */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 text-pink-700 overflow-hidden flex items-center justify-center font-bold text-sm shrink-0">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{emp.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{emp.name}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      {emp.designation || 'Marketing Executive'} • {emp.email}
                    </p>
                  </div>
                </div>

                {/* Active Tasks & Follow-ups Count (Exact Wireframe Split) */}
                <div className="flex items-center space-x-6 text-xs text-slate-600">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Tasks</span>
                    <span className="font-extrabold text-slate-800 text-sm">{emp.stats.tasksCount}</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Follow-ups</span>
                    <span className="font-extrabold text-purple-700 text-sm">{emp.stats.followUpsCount}</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Leads Assigned</span>
                    <span className="font-extrabold text-pink-600 text-sm">{emp.stats.leadsCount}</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Won Revenue</span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      ₹{emp.stats.totalWonRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Two Clean Action Buttons: View (Eye) & Assign (+A) */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenInspect(emp)}
                    className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors"
                    title={`Inspect ${emp.name}'s performance & logs`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setTargetEmployee(emp);
                      setAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center space-x-1 transition-colors border border-purple-200"
                    title={`Assign task to ${emp.name}`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>+A</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Employee Drawer (Eye icon) */}
      <Drawer
        isOpen={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        title={inspectedEmployee?.name || 'Employee Overview'}
        subtitle={inspectedEmployee?.designation || inspectedEmployee?.email}
      >
        {inspectedEmployee && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Assigned Leads</span>
                <span className="text-lg font-bold text-slate-800">{inspectedEmployee.stats.leadsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Closed Deals Revenue</span>
                <span className="text-lg font-bold text-emerald-700">
                  ₹{inspectedEmployee.stats.totalWonRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Tasks & Proofs Uploaded */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Meeting History & Uploaded Proofs ({employeeTasks.length})
              </h4>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {employeeTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No tasks found for this employee.</p>
                ) : (
                  employeeTasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl border border-pink-100 bg-white text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 truncate">{t.title}</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          {t.durationMinutes} mins
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {t.companyName && <span>{t.companyName} • </span>}
                        {new Date(t.scheduledDate).toLocaleDateString()}
                      </div>
                      {t.reportSummary && (
                        <p className="text-slate-600 text-[11px] bg-pink-50/40 p-1.5 rounded mt-1">
                          {t.reportSummary}
                        </p>
                      )}
                      {(t.photoUrl || t.reportUrl) && (
                        <div className="flex items-center space-x-2 pt-1">
                          {t.photoUrl && (
                            <a
                              href={t.photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded flex items-center space-x-1"
                            >
                              <Camera className="w-2.5 h-2.5" />
                              <span>Proof Photo</span>
                            </a>
                          )}
                          {t.reportUrl && (
                            <a
                              href={t.reportUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded flex items-center space-x-1"
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span>Report Doc</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Assign Task Modal (+A) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Task (+A)`}
        subtitle={targetEmployee ? `Assigning directly to ${targetEmployee.name}` : ''}
      >
        <form onSubmit={handleAssignTask} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Priority Client Follow-up"
              value={assignedTask.title}
              onChange={(e) => setAssignedTask({ ...assignedTask, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={assignedTask.type}
                onChange={(e) => setAssignedTask({ ...assignedTask, type: e.target.value as TaskType })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              >
                <option value="CLIENT_MEETING">Client Meeting</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="REPORT">Report</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={assignedTask.scheduledDate}
                onChange={(e) => setAssignedTask({ ...assignedTask, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                placeholder="Company Name"
                value={assignedTask.companyName}
                onChange={(e) => setAssignedTask({ ...assignedTask, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="Person Name"
                value={assignedTask.personName}
                onChange={(e) => setAssignedTask({ ...assignedTask, personName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-pink-50">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Marketing Team Member"
        subtitle="Provision a new employee account"
      >
        <form onSubmit={handleAddMember} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                placeholder="priya@company.com"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="Senior Marketing Executive"
                value={newMember.designation}
                onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-pink-100 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-pink-50">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingMember}
              className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs"
            >
              {addingMember ? 'Provisioning...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

