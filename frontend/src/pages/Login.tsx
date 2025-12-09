import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // Force a full page reload to clear all cached component states
      window.location.href = '/';
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>📊 AttendanceHub</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '35px', fontSize: '14px' }}>
          Sign in to manage your attendance
        </p>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">❌ {error}</div>}
          <div className="form-group">
            <label>📧 Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>🔒 Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '16px' }}>
            Sign In →
          </button>
        </form>
        <div style={{ marginTop: '30px', padding: '20px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: '14px', textAlign: 'center' }}>
          <p style={{ color: '#0369a1', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>🔑 Demo Credentials</p>
          <p style={{ color: '#0c4a6e', fontSize: '13px' }}>admin@school.com / admin123</p>
        </div>
        <p className="text-center" style={{ marginTop: '25px', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#6366f1', fontWeight: '600' }}>Sign up here →</Link>
        </p>
      </div>
    </div>
  );
}
