import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { usersApi, classesApi, attendanceApi } from '../services/api';
import { User, Class } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface TeacherWithClasses extends User {
  assignedClasses: Class[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 });
  const [analytics, setAnalytics] = useState({ present: 0, absent: 0, percentage: '0' });
  const [teachers, setTeachers] = useState<TeacherWithClasses[]>([]);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, analyticsRes] = await Promise.all([
        usersApi.getStudents(),
        usersApi.getTeachers(),
        classesApi.getAll(),
        attendanceApi.getAnalytics({}),
      ]);
      
      setStats({ 
        students: studentsRes.data.length, 
        teachers: teachersRes.data.length, 
        classes: classesRes.data.length 
      });
      setAnalytics(analyticsRes.data);
      
      // Map teachers with their assigned classes
      const teachersWithClasses = teachersRes.data.map((teacher: User) => ({
        ...teacher,
        assignedClasses: classesRes.data.filter((c: Class) => c.teacherId === teacher.id)
      }));
      setTeachers(teachersWithClasses);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const doughnutData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [analytics.present, analytics.absent],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      cutout: '75%',
    }],
  };

  const barData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      label: 'Attendance',
      data: [analytics.present, analytics.absent],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderRadius: 10,
      borderSkipped: false,
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h2>👑 Admin Dashboard</h2>
        <p style={{ color: '#64748b' }}>Welcome back! Here's your overview</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('overview')} className="btn" style={{ 
          background: activeTab === 'overview' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
          color: activeTab === 'overview' ? 'white' : '#64748b'
        }}>📊 Overview</button>
        <button onClick={() => setActiveTab('teachers')} className="btn" style={{ 
          background: activeTab === 'teachers' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
          color: activeTab === 'teachers' ? 'white' : '#64748b'
        }}>👨‍🏫 Teachers & Classes</button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-4 mb-4">
            <div className="card stat-card purple">
              <h3>{stats.students}</h3>
              <p>🎓 Total Students</p>
            </div>
            <div className="card stat-card pink">
              <h3>{stats.teachers}</h3>
              <p>👨‍🏫 Total Teachers</p>
            </div>
            <div className="card stat-card blue">
              <h3>{stats.classes}</h3>
              <p>📚 Total Classes</p>
            </div>
            <div className="card stat-card green">
              <h3>{analytics.percentage}%</h3>
              <p>📊 Attendance Rate</p>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>📈 Attendance Overview</h3>
              <div style={{ maxWidth: '280px', margin: '0 auto', position: 'relative' }}>
                <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{analytics.percentage}%</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Overall</div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>📊 Quick Statistics</h3>
              <Bar data={barData} options={{ 
                responsive: true, 
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
              }} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'teachers' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>👨‍🏫 Teachers with Classes & Students</h3>
          {teachers.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No teachers found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {teachers.map(teacher => (
                <div key={teacher.id} style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  background: expandedTeacher === teacher.id ? '#f8fafc' : 'white'
                }}>
                  <div 
                    onClick={() => setExpandedTeacher(expandedTeacher === teacher.id ? null : teacher.id)}
                    style={{ 
                      padding: '16px 20px', 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                    }}
                  >
                    <div className="flex gap-2 flex-center">
                      <span style={{ fontSize: '24px' }}>👨‍🏫</span>
                      <div>
                        <strong style={{ fontSize: '16px' }}>{teacher.name}</strong>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-center">
                      <span className="badge badge-info">{teacher.assignedClasses.length} Classes</span>
                      <span style={{ fontSize: '20px' }}>{expandedTeacher === teacher.id ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  
                  {expandedTeacher === teacher.id && (
                    <div style={{ padding: '16px 20px' }}>
                      {teacher.assignedClasses.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No classes assigned to this teacher</p>
                      ) : (
                        teacher.assignedClasses.map(cls => (
                          <div key={cls.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                            <div className="flex flex-between flex-center mb-2">
                              <h4 style={{ margin: 0, color: '#1e293b' }}>📚 {cls.name} {cls.batch ? `(${cls.batch})` : ''}</h4>
                              <span className="badge badge-success">{cls.students?.length || 0} Students</span>
                            </div>
                            
                            {/* Subjects */}
                            {cls.subjects && cls.subjects.length > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: '#64748b' }}>Subjects:</strong>
                                <div className="flex gap-1" style={{ marginTop: '6px', flexWrap: 'wrap' }}>
                                  {cls.subjects.map(sub => (
                                    <span key={sub.id} className="badge badge-warning">{sub.name} ({sub.code})</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Students */}
                            {cls.students && cls.students.length > 0 && (
                              <div>
                                <strong style={{ fontSize: '13px', color: '#64748b' }}>Students:</strong>
                                <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                                  {cls.students.map((student: User) => (
                                    <div key={student.id} style={{ 
                                      padding: '8px 12px', 
                                      background: '#f1f5f9', 
                                      borderRadius: '8px',
                                      fontSize: '13px'
                                    }}>
                                      <span style={{ fontWeight: '500' }}>🎓 {student.name}</span>
                                      <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{student.email}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
