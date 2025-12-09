import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { classesApi, leaveApi, attendanceApi, authApi } from '../services/api';
import { Class, LeaveRequest, User } from '../types';

interface StudentWithAttendance extends User {
  attendancePercentage?: string;
  totalClasses?: number;
  presentClasses?: number;
}

export default function TeacherDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [selectedClass, setSelectedClass] = useState<string>(searchParams.get('class') || '');
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAttendance | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', classId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesRes, leavesRes] = await Promise.all([
        classesApi.getAll(),
        leaveApi.getAll('pending')
      ]);
      setClasses(classesRes.data);
      setPendingLeaves(leavesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const loadStudents = async (classId: string) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const res = await attendanceApi.getClassAttendance(classId, {});
      const studentsWithAttendance = res.data.map((item: any) => ({
        ...item.student,
        attendancePercentage: item.percentage,
        totalClasses: item.total,
        presentClasses: item.present
      }));
      setStudents(studentsWithAttendance);
    } catch (err) {
      console.error('Error loading students:', err);
      setStudents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    }
  }, [selectedClass]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const classId = selectedClass || studentForm.classId;
    if (!classId) {
      setError('Please select a class first');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.register({ ...studentForm, classId, role: 'student' });
      setStudentForm({ name: '', email: '', password: '', classId: '' });
      setShowAddStudent(false);
      setSuccess('Student added successfully!');
      loadData();
      if (selectedClass) loadStudents(selectedClass);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add student');
    }
    setLoading(false);
  };

  const getAttendanceColor = (percentage: string | undefined) => {
    const p = parseFloat(percentage || '0');
    if (p >= 75) return '#10b981';
    if (p >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      <div className="page-header">
        <h2>👨‍🏫 Teacher Dashboard</h2>
        <p style={{ color: '#64748b' }}>Manage your classes and students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button onClick={() => { setActiveTab('overview'); setSearchParams({}); }} className="btn" style={{ 
          background: activeTab === 'overview' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
          color: activeTab === 'overview' ? 'white' : '#64748b'
        }}>📊 Overview</button>
        <button onClick={() => { setActiveTab('students'); setSearchParams({ tab: 'students' }); }} className="btn" style={{ 
          background: activeTab === 'students' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
          color: activeTab === 'students' ? 'white' : '#64748b'
        }}>👥 Students List</button>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-3 mb-4">
            <div className="card stat-card purple">
              <h3>{classes.length}</h3>
              <p>📚 My Classes</p>
            </div>
            <div className="card stat-card orange">
              <h3>{pendingLeaves.length}</h3>
              <p>📝 Pending Leaves</p>
            </div>
            <div className="card stat-card green" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Link to="/attendance/mark" className="btn btn-primary" style={{ fontSize: '16px' }}>
                ✅ Mark Attendance
              </Link>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>📚 My Classes</h3>
              {classes.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No classes assigned yet</p>
              ) : (
                <table>
                  <thead><tr><th>Class Name</th><th>Batch</th><th>Students</th></tr></thead>
                  <tbody>
                    {classes.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '600' }}>{c.name}</td>
                        <td><span className="badge badge-info">{c.batch || 'N/A'}</span></td>
                        <td><span className="badge badge-success">{c.students?.length || 0} students</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="card">
              <div className="flex flex-between flex-center mb-2">
                <h3>📝 Pending Leave Requests</h3>
                <Link to="/leave" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>View All</Link>
              </div>
              {pendingLeaves.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No pending requests 🎉</p>
              ) : (
                <table>
                  <thead><tr><th>Student</th><th>Dates</th><th>Action</th></tr></thead>
                  <tbody>
                    {pendingLeaves.slice(0, 5).map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: '500' }}>{l.student?.name}</td>
                        <td style={{ fontSize: '13px', color: '#64748b' }}>{l.startDate} → {l.endDate}</td>
                        <td><Link to="/leave" className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '11px' }}>Review</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <>
          {/* Add Student Button */}
          <div className="flex flex-between flex-center mb-4">
            <div className="flex gap-2 flex-center">
              <select 
                value={selectedClass} 
                onChange={e => { 
                  setSelectedClass(e.target.value); 
                  setSearchParams(e.target.value ? { tab: 'students', class: e.target.value } : { tab: 'students' }); 
                }}
                style={{ padding: '10px 15px', minWidth: '200px' }}
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.batch ? `(${c.batch})` : ''}</option>
                ))}
              </select>
              {selectedClass && (
                <input 
                  type="text"
                  placeholder="🔍 Search student..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '10px 15px', minWidth: '250px' }}
                />
              )}
            </div>
            {selectedClass && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddStudent(!showAddStudent)}
              >
                {showAddStudent ? '✕ Cancel' : '➕ Add Student'}
              </button>
            )}
          </div>

          {/* Add Student Form */}
          {showAddStudent && (
            <div className="card mb-4">
              <h3 style={{ marginBottom: '20px' }}>🎓 Add New Student {selectedClass && `to ${classes.find(c => c.id === selectedClass)?.name || ''}`}</h3>
              <form onSubmit={handleAddStudent}>
                <div className="grid grid-3 gap-2">
                  <div className="form-group">
                    <label>👤 Student Name *</label>
                    <input 
                      value={studentForm.name} 
                      onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} 
                      placeholder="e.g., John Doe" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>📧 Email *</label>
                    <input 
                      type="email"
                      value={studentForm.email} 
                      onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} 
                      placeholder="e.g., student@college.com" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>🔒 Password *</label>
                    <input 
                      type="password"
                      value={studentForm.password} 
                      onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} 
                      placeholder="Min 6 characters" 
                      required 
                      minLength={6}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Adding...' : '💾 Add Student'}
                </button>
              </form>
            </div>
          )}

          {/* Student Profile Modal */}
          {selectedStudent && (
            <div style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
            }} onClick={() => setSelectedStudent(null)}>
              <div className="card" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <div className="flex flex-between flex-center mb-4">
                  <h3>👤 Student Profile</h3>
                  <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 15px', fontSize: '32px', color: 'white'
                  }}>
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 style={{ margin: '0 0 5px' }}>{selectedStudent.name}</h2>
                  <p style={{ color: '#64748b', margin: 0 }}>{selectedStudent.email}</p>
                </div>
                <div style={{ 
                  background: '#f8fafc', padding: '20px', borderRadius: '12px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: getAttendanceColor(selectedStudent.attendancePercentage) }}>
                      {selectedStudent.attendancePercentage || 0}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Attendance</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                      {selectedStudent.presentClasses || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Present</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>
                      {selectedStudent.totalClasses || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Total Classes</div>
                  </div>
                </div>
                {parseFloat(selectedStudent.attendancePercentage || '0') < 75 && (
                  <div className="alert alert-error mt-4" style={{ margin: '15px 0 0' }}>
                    ⚠️ Attendance below 75% - Needs improvement
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Students List */}
          {!selectedClass ? (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                👆 Select a class to view students
              </p>
            </div>
          ) : loading ? (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>⏳ Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                {searchTerm ? 'No students found matching your search' : 'No students in this class'}
              </p>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>👥 Students ({filteredStudents.length})</h3>
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Attendance</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td style={{ color: '#64748b' }}>{s.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '60px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' 
                          }}>
                            <div style={{ 
                              width: `${s.attendancePercentage || 0}%`, 
                              height: '100%', 
                              background: getAttendanceColor(s.attendancePercentage),
                              borderRadius: '4px'
                            }}></div>
                          </div>
                          <span style={{ fontWeight: '600', color: getAttendanceColor(s.attendancePercentage) }}>
                            {s.attendancePercentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {parseFloat(s.attendancePercentage || '0') >= 75 ? (
                          <span className="badge badge-success">Good</span>
                        ) : parseFloat(s.attendancePercentage || '0') >= 50 ? (
                          <span className="badge badge-warning">Warning</span>
                        ) : (
                          <span className="badge badge-danger">Low</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-info" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => setSelectedStudent(s)}
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
