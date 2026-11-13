import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { HeadHomeTab } from './tabs/HeadHomeTab';
import { DealsRevenueTab } from './tabs/DealsRevenueTab';
import { TeamManagementTab } from './tabs/TeamManagementTab';
import { TeamScheduleTab } from './tabs/TeamScheduleTab';
import {
  Home,
  IndianRupee,
  Users2,
  CalendarCheck,
} from 'lucide-react';

export const MarketingHeadDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'deals', label: 'Deals & Revenue', icon: IndianRupee },
    { id: 'team', label: 'Team Management', icon: Users2 },
    { id: 'schedules', label: 'Schedule & Performance', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9FB]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HeadHomeTab onNavigateTab={setActiveTab} />}
        {activeTab === 'deals' && <DealsRevenueTab />}
        {activeTab === 'team' && <TeamManagementTab />}
        {activeTab === 'schedules' && <TeamScheduleTab />}
      </main>
    </div>
  );
};

