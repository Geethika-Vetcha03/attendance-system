import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MarkAttendance from './pages/MarkAttendance';
import ManageClasses from './pages/ManageClasses';
import ManageUsers from './pages/ManageUsers';
import LeaveRequests from './pages/LeaveRequests';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function PrivateRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
      case 'admin': return <AdminDashboard />;
      case 'teacher': return <TeacherDashboard />;
      case 'student': return <StudentDashboard />;
      default: return <Navigate to="/login" />;
    }
  };

  // Use user.id as key to force re-render all components when user changes
  const userKey = user?.id || 'guest';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<PrivateRoute><Layout key={userKey}>{getDashboard()}</Layout></PrivateRoute>} />
      <Route path="/attendance/mark" element={<PrivateRoute roles={['admin', 'teacher']}><Layout key={userKey}><MarkAttendance /></Layout></PrivateRoute>} />
      <Route path="/classes" element={<PrivateRoute roles={['admin', 'teacher']}><Layout key={userKey}><ManageClasses /></Layout></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute roles={['admin']}><Layout key={userKey}><ManageUsers /></Layout></PrivateRoute>} />
      <Route path="/leave" element={<PrivateRoute><Layout key={userKey}><LeaveRequests /></Layout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={['admin', 'teacher']}><Layout key={userKey}><Reports /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
