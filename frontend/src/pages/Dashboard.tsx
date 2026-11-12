import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserDashboard } from './UserDashboard';
import { AdminDashboard } from './AdminDashboard';
import { CeoExecutivePage } from './CeoExecutivePage';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'CEO') {
    return <CeoExecutivePage />;
  }

  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    return <AdminDashboard />;
  }

  // Default: Marketing Employee Dashboard
  return <UserDashboard />;
};

export default Dashboard;
