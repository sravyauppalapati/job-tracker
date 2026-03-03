import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Analytics from './pages/Analytics';

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Layout with sidebar
function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// Auth route (redirect if logged in)
function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/jobs" element={
            <PrivateRoute>
              <AppLayout><Jobs /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/jobs/:id" element={
            <PrivateRoute>
              <AppLayout><JobDetail /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute>
              <AppLayout><Analytics /></AppLayout>
            </PrivateRoute>
          } />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
