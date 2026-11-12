import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { TaskAndSchedule } from './pages/TaskAndSchedule';
import { ProgressModule } from './pages/ProgressModule';
import { ClientsManagement } from './pages/ClientsManagement';
import { TeamManagement } from './pages/TeamManagement';
import { FieldTracking } from './pages/FieldTracking';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="schedule" element={<TaskAndSchedule />} />
              <Route path="progress" element={<ProgressModule />} />
              <Route path="clients" element={<ClientsManagement />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="tracking" element={<FieldTracking />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />

              {/* Legacy navigation redirects */}
              <Route path="tasks" element={<Navigate to="/schedule?tab=meetings" replace />} />
              <Route path="followups" element={<Navigate to="/schedule?tab=followups" replace />} />
              <Route path="reports" element={<Navigate to="/schedule?tab=reports" replace />} />
              <Route path="analytics" element={<Navigate to="/progress" replace />} />
              <Route path="pipeline" element={<Navigate to="/leads" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
