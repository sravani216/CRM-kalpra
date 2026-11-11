import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Leads } from './pages/Leads';
import { SalesPipeline } from './pages/SalesPipeline';
import { Tasks } from './pages/Tasks';
import { FollowUps } from './pages/FollowUps';
import { FieldTracking } from './pages/FieldTracking';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
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
              <Route path="clients" element={<Clients />} />
              <Route path="leads" element={<Leads />} />
              <Route path="pipeline" element={<SalesPipeline />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="followups" element={<FollowUps />} />
              <Route path="tracking" element={<FieldTracking />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;

