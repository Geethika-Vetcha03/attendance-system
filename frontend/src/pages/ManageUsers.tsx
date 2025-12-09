import { useEffect, useState } from 'react';
import { usersApi, classesApi, authApi } from '../services/api';
import { User, Class } from '../types';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'student', phone: '', classId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = () => {
    usersApi.getAll(filter || undefined).then(res => setUsers(res.data)).catch(err => console.error(err));
    classesApi.getAll().then(res => setClasses(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const userData = { ...form };
      if (!userData.classId) delete (userData as any).classId;
      if (!userData.phone) delete (userData as any).phone;
      await authApi.register(userData);
      setForm({ email: '', password: '', name: '', role: 'student', phone: '', classId: '' });
      setShowForm(false);
      setSuccess('User created successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this user?')) { await usersApi.delete(id); loadData(); }
  };

  const handleAssignClass = async (userId: string, classId: string) => {
    await usersApi.assignClass(userId, classId);
    loadData();
  };

  const getRoleBadge = (role: string) => {
    const classes: Record<string, string> = { admin: 'badge-danger', teacher: 'badge-info', student: 'badge-success' };
    return <span className={`badge ${classes[role]}`}>{role}</span>;
  };

  return (
    <div>
      <div className="flex flex-between flex-center mb-4">
        <h2>👥 Manage Users</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '➕ Add User'}</button>
      </div>
      
      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}
      
      {showForm && (
        <div className="card mb-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3 gap-2">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
              <div className="form-group"><label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              {form.role === 'student' && (
                <div className="form-group">
                  <label>Assign to Class</label>
                  <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
                    <option value="">-- Select Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.batch ? `(${c.batch})` : ''}</option>)}
                  </select>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save User'}
            </button>
          </form>
        </div>
      )}
      <div className="card">
        <div className="mb-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '200px' }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Class</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{getRoleBadge(u.role)}</td>
                <td>
                  {u.role === 'student' ? (
                    <select value={u.classId || ''} onChange={e => handleAssignClass(u.id, e.target.value)}>
                      <option value="">No Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : '-'}
                </td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(u.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
