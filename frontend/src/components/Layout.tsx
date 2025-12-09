import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
        <div className="flex flex-center">
          <span className="nav-brand">📊 AttendanceHub</span>
          <Link to="/" style={{ borderBottomColor: isActive('/') ? 'white' : 'transparent' }}>🏠 Dashboard</Link>
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
        <div className="user-info">
          <span>{getRoleIcon(user?.role || '')} {user?.name}</span>
          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '12px' }}>Logout</button>
        </div>
      </nav>
      <div className="container">{children}</div>
    </div>
  );
}
