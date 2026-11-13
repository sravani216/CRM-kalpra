import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { TaskSchedule, User } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { CalendarView } from '../../../components/calendar/CalendarView';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Building2,
  Phone,
  Camera,
  FileText,
  Filter,
} from 'lucide-react';

export const TeamScheduleTab: React.FC = () => {
  const [tasks, setTasks] = useState<TaskSchedule[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, [selectedEmployeeId]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get<{ success: boolean; team: User[] }>('/users/team');
      setEmployees(res.team || []);
    } catch (err) {}
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get<{ success: boolean; tasks: TaskSchedule[] }>('/tasks', {
        employeeId: selectedEmployeeId || undefined,
      });
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const td = new Date(t.scheduledDate);
    return (
      td.getDate() === selectedDate.getDate() &&
      td.getMonth() === selectedDate.getMonth() &&
      td.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-pink-100/80 p-4 shadow-soft flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Department Schedule Overview</h3>
          <p className="text-xs text-slate-400">Track all employee client visits, meetings, and reports.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-pink-100 bg-pink-50/20 text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300"
          >
            <option value="">All Marketing Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <CalendarView
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        title="Team Allocation Calendar"
      />

      {/* Task List for Selected Date */}
      <div className="bg-white rounded-2xl border border-pink-100/80 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-pink-50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({filteredTasks.length})
          </h4>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-slate-400">No tasks logged on this date.</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-50">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between text-xs hover:bg-pink-50/20">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{task.title}</span>
                    <Badge status={task.status} size="sm" />
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center space-x-2">
                    <span>Assigned to: <strong className="text-slate-700">{task.assignedTo?.name || 'Employee'}</strong></span>
                    {task.companyName && <span>• {task.companyName}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-600">
                  {task.durationMinutes > 0 && (
                    <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                      {task.durationMinutes}m
                    </span>
                  )}
                  {(task.photoUrl || task.reportUrl) && (
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                      Proof Attached
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

