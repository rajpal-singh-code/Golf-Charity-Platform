import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="brand-dot" />
        GolfGive
      </div>

      <div className="navbar-links">
        {!user ? (
          <>
            <button className="nav-link" onClick={() => navigate('/charities')}>Charities</button>
            <button className="nav-link" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </>
        ) : (
          <>
            {user.role === 'admin' ? (
              <button className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => navigate('/admin')}>
                <Shield size={15} style={{ display: 'inline', marginRight: 4 }} />
                Admin Panel
              </button>
            ) : (
              <button className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button className="btn-ghost btn btn-sm" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
