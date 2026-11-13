import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MarketingHeadDashboard } from './pages/marketingHead/MarketingHeadDashboard';
import { CeoDashboard } from './pages/ceo/CeoDashboard';
import { Role } from './types';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9FB] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their assigned dashboard
    if (user.role === 'CEO') return <Navigate to="/ceo" replace />;
    if (user.role === 'MARKETING_HEAD') return <Navigate to="/marketing-head" replace />;
    return <Navigate to="/employee" replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const RootRedirector: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9FB] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'CEO') return <Navigate to="/ceo" replace />;
  if (user.role === 'MARKETING_HEAD') return <Navigate to="/marketing-head" replace />;
  return <Navigate to="/employee" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirector />} />

          {/* Employee Workspace */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Marketing Head Workspace */}
          <Route
            path="/marketing-head"
            element={
              <ProtectedRoute allowedRoles={['MARKETING_HEAD']}>
                <MarketingHeadDashboard />
              </ProtectedRoute>
            }
          />

          {/* CEO Executive Dashboard */}
          <Route
            path="/ceo"
            element={
              <ProtectedRoute allowedRoles={['CEO']}>
                <CeoDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
