import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Clear any stale tokens and redirect logged-in users
  useEffect(() => {
    // Clear old token to ensure fresh login
    localStorage.removeItem('token');
  }, []);
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Attempting login with:', { email, password: '***' });
    try {
      await login(email, password);
      // Force a full page reload to clear all cached component states
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(message);
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
        <p className="text-center" style={{ marginTop: '30px', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#6366f1', fontWeight: '600' }}>Sign up here →</Link>
        </p>
      </div>
    </div>
  );
}
