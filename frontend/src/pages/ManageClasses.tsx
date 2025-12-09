import { useEffect, useState } from 'react';
import { classesApi, subjectsApi, usersApi } from '../services/api';
import { Class, User } from '../types';

export default function ManageClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [form, setForm] = useState({ name: '', batch: '', teacherId: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesRes, teachersRes] = await Promise.all([
        classesApi.getAll(),
        usersApi.getTeachers()
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const payload: any = { name: form.name, batch: form.batch };
      if (form.teacherId) {
        payload.teacherId = form.teacherId;
      }
      
      await classesApi.create(payload);
      setForm({ name: '', batch: '', teacherId: '' });
      setShowForm(false);
      setSuccess('Class created successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating class:', err);
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!subjectForm.classId) {
      setError('Please select a class');
      return;
    }
    if (!subjectForm.name.trim()) {
      setError('Please enter subject name');
      return;
    }
    
    try {
      console.log('Creating subject:', subjectForm);
      await subjectsApi.create(subjectForm);
      setSubjectForm({ name: '', code: '', classId: '' });
      setShowSubjectForm(false);
      setSuccess('Subject created successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating subject:', err);
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this class? This will also remove all subjects and unassign students.')) {
      try {
        await classesApi.delete(id);
        setSuccess('Class deleted successfully!');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    if (confirm(`Delete subject "${subjectName}"?`)) {
      try {
        await subjectsApi.delete(subjectId);
        setSuccess('Subject deleted successfully!');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete subject');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>📚 Manage Classes</h2>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setShowSubjectForm(false); }}>
            {showForm ? '✕ Cancel' : '➕ Add Class'}
          </button>
          <button className="btn btn-success" onClick={() => { setShowSubjectForm(!showSubjectForm); setShowForm(false); }}>
            {showSubjectForm ? '✕ Cancel' : '📖 Add Subject'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {showForm && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: '20px' }}>➕ Create New Class</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3 gap-2">
              <div className="form-group">
                <label>📝 Class Name *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="e.g., Class 10A" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>📅 Batch/Year</label>
                <input 
                  value={form.batch} 
                  onChange={e => setForm({ ...form, batch: e.target.value })} 
                  placeholder="e.g., 2024" 
                />
              </div>
              <div className="form-group">
                <label>👨‍🏫 Assign Teacher (Optional)</label>
                <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                  <option value="">-- No Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
                {teachers.length === 0 && (
                  <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '5px' }}>
                    ⚠️ No teachers available. Add teachers from Users page first.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">💾 Save Class</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showSubjectForm && (
        <div className="card mb-4">
          <h3 style={{ marginBottom: '20px' }}>📖 Create New Subject</h3>
          <form onSubmit={handleSubjectSubmit}>
            <div className="grid grid-3 gap-2">
              <div className="form-group">
                <label>📝 Subject Name *</label>
                <input 
                  value={subjectForm.name} 
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} 
                  placeholder="e.g., Mathematics" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>🔢 Subject Code</label>
                <input 
                  value={subjectForm.code} 
                  onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} 
                  placeholder="e.g., MATH101" 
                />
              </div>
              <div className="form-group">
                <label>📚 Assign to Class *</label>
                <select 
                  value={subjectForm.classId} 
                  onChange={e => setSubjectForm({ ...subjectForm, classId: e.target.value })} 
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.batch ? `(${c.batch})` : ''}</option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '5px' }}>
                    ⚠️ No classes available. Create a class first.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-success">💾 Save Subject</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>📋 All Classes ({classes.length})</h3>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</p>
        ) : classes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No classes found. Create your first class!</p>
        ) : (
          <table>
            <thead>
              <tr><th>Class Name</th><th>Batch</th><th>Teacher</th><th>Students</th><th>Subjects</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td><span className="badge badge-info">{c.batch || 'N/A'}</span></td>
                  <td>{c.teacher?.name || <span style={{ color: '#94a3b8' }}>Not assigned</span>}</td>
                  <td><span className="badge badge-success">{c.students?.length || 0}</span></td>
                  <td>
                    {c.subjects?.length ? (
                      c.subjects.map(s => (
                        <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '5px', marginBottom: '3px' }}>
                          <span className="badge badge-warning">{s.name}</span>
                          <button 
                            onClick={() => handleDeleteSubject(s.id, s.name)}
                            style={{ 
                              marginLeft: '2px', 
                              padding: '2px 6px', 
                              fontSize: '10px', 
                              background: '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >✕</button>
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No subjects</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '8px 16px', fontSize: '12px' }} 
                      onClick={() => handleDelete(c.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
