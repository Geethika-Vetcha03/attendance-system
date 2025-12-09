import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role });
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ width: '500px' }}>
        <h2>🚀 Create Account</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '35px', fontSize: '14px' }}>
          Join AttendanceHub today
        </p>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">❌ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}
          <div className="form-group">
            <label>👤 Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" required />
          </div>
          <div className="form-group">
            <label>📧 Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" required />
          </div>
          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label>🔒 Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label>🔒 Confirm</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm password" required />
            </div>
          </div>
          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label>📱 Phone (Optional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div className="form-group">
              <label>🎭 Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">🎓 Student</option>
                <option value="teacher">👨‍🏫 Teacher</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '16px' }}>
            Create Account →
          </button>
        </form>
        <p className="text-center" style={{ marginTop: '25px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: '600' }}>Sign in here →</Link>
        </p>
      </div>
    </div>
  );
}
