import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    notificationsApi.getUnreadCount().then(res => setUnreadCount(res.data.count)).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return '👑';
      case 'teacher': return '👨‍🏫';
      case 'student': return '🎓';
      default: return '👤';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-wrapper">
      <nav className="nav">
        <div className="flex flex-center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <span className="nav-brand">📊 AttendanceHub</span>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop Navigation */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <Link to="/dashboard" style={{ borderBottomColor: isActive('/dashboard') ? 'white' : 'transparent' }}>🏠 Dashboard</Link>
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <>
                <Link to="/attendance/mark">✅ Mark</Link>
                <Link to="/classes">📚 Classes</Link>
                <Link to="/reports">📈 Reports</Link>
              </>
            )}
            {user?.role === 'admin' && <Link to="/users">👥 Users</Link>}
            <Link to="/leave">
              📝 Leave {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: '5px', padding: '4px 8px' }}>{unreadCount}</span>}
            </Link>
          </div>

          {/* User Info */}
          <div className="user-info">
            <span>{getRoleIcon(user?.role || '')} {user?.name}</span>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '12px' }}>Logout</button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            display: 'none',
            flexDirection: 'column',
            width: '100%',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '10px',
            marginTop: '10px'
          }}>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', borderRadius: '8px', background: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent' }}>🏠 Dashboard</Link>
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <>
                <Link to="/attendance/mark" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', borderRadius: '8px' }}>✅ Mark</Link>
                <Link to="/classes" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', borderRadius: '8px' }}>📚 Classes</Link>
                <Link to="/reports" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', borderRadius: '8px' }}>📈 Reports</Link>
              </>
            )}
            {user?.role === 'admin' && <Link to="/users" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', borderRadius: '8px' }}>👥 Users</Link>}
            <Link to="/leave" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', borderRadius: '8px' }}>
              📝 Leave {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: '5px' }}>{unreadCount}</span>}
            </Link>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '10px', paddingTop: '10px' }}>
              <div style={{ padding: '8px', color: 'white', fontSize: '14px' }}>
                {getRoleIcon(user?.role || '')} {user?.name} <span className="badge badge-info" style={{ marginLeft: '8px' }}>{user?.role}</span>
              </div>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', marginTop: '8px' }}>Logout</button>
            </div>
          </div>
        )}
      </nav>
      <div className="container">{children}</div>
    </div>
  );
}
