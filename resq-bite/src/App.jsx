import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './components/landing/LandingPage';
import StudentDashboard from './components/dashboard/StudentDashboard';
import MerchantDashboard from './components/dashboard/MerchantDashboard';
import NGODashboard from './components/dashboard/NGODashboard';
import OrderHistory from './components/dashboard/OrderHistory';
import Leaderboard from './components/dashboard/Leaderboard';
import ToastNotification from './components/ui/Toast';

const ProtectedRoute = ({ role, children, allowAnyUser = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowAnyUser && user?.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/merchant" element={<ProtectedRoute role="merchant"><MerchantDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/ngo" element={<ProtectedRoute role="ngo"><NGODashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowAnyUser={true}><OrderHistory /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute allowAnyUser={true}><Leaderboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastNotification />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;