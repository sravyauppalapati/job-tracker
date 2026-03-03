import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '◈', label: 'Dashboard' },
    { path: '/jobs', icon: '⊞', label: 'All Applications' },
    { path: '/analytics', icon: '▣', label: 'Analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">Job<span className="logo-dot">Tracker</span></div>
        <div className="logo-sub">Command Center</div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Navigation</div>
        {navItems.map(item => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">JOB SEEKER</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">⏏</button>
        </div>
      </div>
    </aside>
  );
}
