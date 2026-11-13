import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { HomeTab } from './tabs/HomeTab';
import { LeadsTab } from './tabs/LeadsTab';
import { TasksScheduleTab } from './tabs/TasksScheduleTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { SettingsTab } from './tabs/SettingsTab';
import {
  Home,
  Users2,
  CalendarCheck,
  TrendingUp,
  Settings as SettingsIcon,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [jumpTaskId, setJumpTaskId] = useState<string | null>(null);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'leads', label: 'Lead Management', icon: Users2 },
    { id: 'tasks', label: 'Schedules / Tasks', icon: CalendarCheck },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleJumpToTasks = (taskId?: string) => {
    if (taskId) setJumpTaskId(taskId);
    setActiveTab('tasks');
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomeTab onJumpToTasks={handleJumpToTasks} />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'tasks' && <TasksScheduleTab initialTaskId={jumpTaskId} />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

