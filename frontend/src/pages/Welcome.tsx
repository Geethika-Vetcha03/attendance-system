import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRoleSelect = (role: string) => {
    navigate('/signup', { state: { role } });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">
            <span className="welcome-icon">📊</span>
            Welcome to AttendanceHub
          </h1>
          <p className="welcome-subtitle">
            Streamline your attendance management with ease
          </p>
        </div>

        <div className="role-selection">
          <h2 className="role-title">Select Your Role</h2>
          <p className="role-subtitle">Choose how you'll be using AttendanceHub</p>

          <div className="role-cards">
            <div className="role-card student-card" onClick={() => handleRoleSelect('student')}>
              <div className="role-icon">🎓</div>
              <h3>Student</h3>
              <p>View your attendance, apply for leave, and track your progress</p>
              <button className="role-btn">Get Started →</button>
            </div>

            <div className="role-card teacher-card" onClick={() => handleRoleSelect('teacher')}>
              <div className="role-icon">👨‍🏫</div>
              <h3>Teacher</h3>
              <p>Mark attendance, manage classes, and review student performance</p>
              <button className="role-btn">Get Started →</button>
            </div>

            <div className="role-card admin-card" onClick={() => handleRoleSelect('admin')}>
              <div className="role-icon">👑</div>
              <h3>Admin</h3>
              <p>Full system access, manage users, classes, and generate reports</p>
              <button className="role-btn">Get Started →</button>
            </div>
          </div>

          <div className="login-link">
            <p>Already have an account? <a href="/login">Sign in here →</a></p>
          </div>
        </div>
      </div>

      <style>{`
        .welcome-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .welcome-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 50%;
          top: -200px;
          right: -200px;
          opacity: 0.3;
        }

        .welcome-container::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 50%;
          bottom: -100px;
          left: -100px;
          opacity: 0.3;
        }

        .welcome-content {
          max-width: 1200px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .welcome-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .welcome-title {
          font-size: 56px;
          font-weight: 800;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          text-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .welcome-icon {
          font-size: 64px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .welcome-subtitle {
          font-size: 20px;
          color: rgba(255,255,255,0.9);
          font-weight: 400;
        }

        .role-selection {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-radius: 30px;
          padding: 50px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        }

        .role-title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .role-subtitle {
          text-align: center;
          font-size: 16px;
          color: #64748b;
          margin-bottom: 40px;
        }

        .role-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 40px;
        }

        .role-card {
          background: white;
          border-radius: 20px;
          padding: 40px 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 3px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .student-card::before {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .teacher-card::before {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .admin-card::before {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .role-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .student-card:hover {
          border-color: #43e97b;
        }

        .teacher-card:hover {
          border-color: #667eea;
        }

        .admin-card:hover {
          border-color: #fa709a;
        }

        .role-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .role-card h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
        }

        .role-card p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 25px;
          min-height: 60px;
        }

        .role-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Poppins', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .login-link {
          text-align: center;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
        }

        .login-link p {
          font-size: 15px;
          color: #64748b;
        }

        .login-link a {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s;
        }

        .login-link a:hover {
          color: #764ba2;
        }

        @media (max-width: 1024px) {
          .role-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .welcome-title {
            font-size: 36px;
            flex-direction: column;
            gap: 10px;
          }

          .welcome-icon {
            font-size: 48px;
          }

          .welcome-subtitle {
            font-size: 16px;
          }

          .role-selection {
            padding: 30px 20px;
          }

          .role-title {
            font-size: 24px;
          }

          .role-cards {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .role-card {
            padding: 30px 20px;
          }

          .role-card p {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}
