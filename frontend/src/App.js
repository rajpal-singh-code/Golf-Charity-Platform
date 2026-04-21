import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import Navbar from './components/ui/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import CharitiesPage from './pages/CharitiesPage';

import './styles/global.css';

// Pages that should NOT show the top navbar (they have their own layout)
const PAGES_WITHOUT_NAVBAR = ['/dashboard', '/admin'];

function AppContent() {
  return (
    <>
      {/* Navbar is shown on public pages; dashboard/admin have their own sidebar */}
      <Routes>
        <Route path="/dashboard/*" element={null} />
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/charities" element={<CharitiesPage />} />

        {/* Auth routes — redirect if already logged in */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <>
              <Navbar />
              <LoginPage />
            </>
          </PublicOnlyRoute>
        } />
        <Route path="/register" element={
          <PublicOnlyRoute>
            <>
              <Navbar />
              <RegisterPage />
            </>
          </PublicOnlyRoute>
        } />

        {/* User dashboard — requires auth */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <DashboardPage />
            </>
          </ProtectedRoute>
        } />

        {/* Admin panel — requires auth + admin role */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <>
              <Navbar />
              <AdminPage />
            </>
          </AdminRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="page-loader" style={{ flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900, color: 'var(--text-muted)' }}>404</div>
            <p>Page not found</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: 'var(--accent)', secondary: '#0a0c0f' } },
          }}
        />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
