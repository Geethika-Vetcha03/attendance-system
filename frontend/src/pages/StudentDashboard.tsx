import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { attendanceApi, leaveApi, notificationsApi, reportsApi } from '../services/api';
import { Attendance, LeaveRequest, Notification } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

interface SubjectAttendance {
  subjectId: string;
  subjectName: string;
  total: number;
  present: number;
  percentage: string;
}

interface TeacherRemark {
  id: string;
  date: string;
  subject: string;
  status: string;
  remarks: string;
  teacher: string;
}

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState<{ records: Attendance[]; percentage: string; present: number; absent: number; excused: number; total: number }>({ records: [], percentage: '0', present: 0, absent: 0, excused: 0, total: 0 });
  const [subjectWise, setSubjectWise] = useState<SubjectAttendance[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<{ week: string; percentage: number }[]>([]);
  const [monthlyCalendar, setMonthlyCalendar] = useState<{ calendar: Record<string, { status: string }[]>; totalDays: number }>({ calendar: {}, totalDays: 30 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [remarks, setRemarks] = useState<TeacherRemark[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMonthlyCalendar();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [attRes, subjectRes, weeklyRes, notifRes, leaveRes, remarksRes] = await Promise.all([
        attendanceApi.getMyAttendance({}),
        attendanceApi.getMySubjectWise(),
        attendanceApi.getMyWeeklyProgress(4),
        notificationsApi.getAll(),
        leaveApi.getMyLeaves(),
        attendanceApi.getMyRemarks()
      ]);
      console.log('Attendance data:', attRes.data);
      console.log('Subject-wise:', subjectRes.data);
      setAttendance(attRes.data);
      setSubjectWise(subjectRes.data);
      setWeeklyProgress(weeklyRes.data);
      setNotifications(notifRes.data);
      setLeaveRequests(leaveRes.data);
      setRemarks(remarksRes.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    }
    setLoading(false);
  };

  const loadMonthlyCalendar = async () => {
    try {
      const res = await attendanceApi.getMyMonthly(selectedMonth, selectedYear);
      setMonthlyCalendar(res.data);
    } catch (err) {
      console.error('Error loading calendar:', err);
    }
  };

  const downloadReport = async (type: 'pdf' | 'excel') => {
    setDownloading(true);
    try {
      const startDate = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
      const res = type === 'pdf' 
        ? await reportsApi.exportPdf({ startDate, endDate })
        : await reportsApi.exportExcel({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
    } catch (err) {
      console.error('Error downloading report:', err);
    }
    setDownloading(false);
  };

  const getBadges = () => {
    const badges = [];
    if (Number(attendance.percentage) >= 95) badges.push({ icon: '🏆', name: 'Perfect Attendance', color: '#ffd700' });
    if (Number(attendance.percentage) >= 90) badges.push({ icon: '⭐', name: 'Star Student', color: '#10b981' });
    if (attendance.present >= 30) badges.push({ icon: '🎯', name: '30 Days Streak', color: '#6366f1' });
    if (leaveRequests.filter(l => l.status === 'approved').length === 0 && attendance.total > 20) badges.push({ icon: '💪', name: 'No Leaves', color: '#ec4899' });
    return badges;
  };

  const doughnutData = {
    labels: ['Present', 'Absent', 'Leave'],
    datasets: [{
      data: [attendance.present, attendance.absent, attendance.excused],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0,
      cutout: '70%',
    }],
  };

  const subjectBarData = {
    labels: subjectWise.map(s => s.subjectName.substring(0, 15)),
    datasets: [{
      label: 'Attendance %',
      data: subjectWise.map(s => parseFloat(s.percentage)),
      backgroundColor: subjectWise.map(s => parseFloat(s.percentage) >= 75 ? '#10b981' : '#ef4444'),
      borderRadius: 8,
    }],
  };

  const weeklyLineData = {
    labels: weeklyProgress.map(w => w.week),
    datasets: [{
      label: 'Attendance %',
      data: weeklyProgress.map(w => w.percentage),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const renderCalendar = () => {
    const days = [];
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    
    for (let day = 1; day <= monthlyCalendar.totalDays; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = monthlyCalendar.calendar[dateKey];
      let bgColor = '#f1f5f9';
      if (dayData && dayData.length > 0) {
        const hasPresent = dayData.some(d => d.status === 'present' || d.status === 'late');
        const hasAbsent = dayData.some(d => d.status === 'absent');
        const hasExcused = dayData.some(d => d.status === 'excused');
        if (hasPresent) bgColor = '#d1fae5';
        else if (hasAbsent) bgColor = '#fee2e2';
        else if (hasExcused) bgColor = '#fef3c7';
      }
      days.push(
        <div key={day} className="calendar-day" style={{ background: bgColor, padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
          {day}
        </div>
      );
    }
    return days;
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-info', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>🎓 My Dashboard</h2>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => downloadReport('pdf')} disabled={downloading}>
            {downloading ? '⏳' : '📄'} PDF
          </button>
          <button className="btn btn-success" onClick={() => downloadReport('excel')} disabled={downloading}>
            {downloading ? '⏳' : '📊'} Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {['overview', 'subjects', 'calendar', 'history', 'leaves', 'remarks'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="btn" style={{ 
            background: activeTab === tab ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
            color: activeTab === tab ? 'white' : '#64748b',
            textTransform: 'capitalize'
          }}>
            {tab === 'overview' && '📊'} {tab === 'subjects' && '📚'} {tab === 'calendar' && '📅'} {tab === 'history' && '📋'} {tab === 'leaves' && '📝'} {tab === 'remarks' && '💬'} {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card mb-4" style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Loading your dashboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-4">
          ❌ {error}
        </div>
      )}

      {/* Low Attendance Alert */}
      {!loading && Number(attendance.percentage) < 75 && attendance.total > 0 && (
        <div className="alert alert-error mb-4">
          ⚠️ Your attendance is {attendance.percentage}% which is below 75%. Please improve your attendance to avoid academic issues.
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-4 mb-4">
            <div className="card stat-card blue"><h3>{attendance.percentage}%</h3><p>📊 Overall</p></div>
            <div className="card stat-card green"><h3>{attendance.present}</h3><p>✅ Present</p></div>
            <div className="card stat-card pink"><h3>{attendance.absent}</h3><p>❌ Absent</p></div>
            <div className="card stat-card orange"><h3>{attendance.excused}</h3><p>📝 Leave</p></div>
          </div>

          {/* Badges */}
          {getBadges().length > 0 && (
            <div className="card mb-4">
              <h3 style={{ marginBottom: '15px' }}>🏅 Your Badges</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {getBadges().map((badge, i) => (
                  <div key={i} style={{ background: `${badge.color}20`, padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{badge.icon}</span>
                    <span style={{ fontWeight: '600', color: badge.color }}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-2">
            {/* Doughnut Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>📈 Attendance Overview</h3>
              <div style={{ maxWidth: '250px', margin: '0 auto', position: 'relative' }}>
                <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{attendance.percentage}%</div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>📈 Weekly Progress</h3>
              <Line data={weeklyLineData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </div>
          </div>

          {/* Notifications */}
          <div className="card mt-4">
            <h3 style={{ marginBottom: '15px' }}>🔔 Notifications</h3>
            {notifications.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No notifications</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} style={{ padding: '12px', borderRadius: '10px', marginBottom: '8px', background: n.isRead ? '#f8fafc' : '#eff6ff', borderLeft: `4px solid ${n.isRead ? '#94a3b8' : '#6366f1'}` }}>
                    <strong>{n.title}</strong>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'subjects' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📚 Subject-wise Attendance</h3>
          {subjectWise.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No attendance records yet</p>
          ) : (
            <>
              <div style={{ height: '300px', marginBottom: '20px' }}>
                <Bar data={subjectBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
              </div>
              <table>
                <thead><tr><th>Subject</th><th>Classes</th><th>Present</th><th>Percentage</th><th>Status</th></tr></thead>
                <tbody>
                  {subjectWise.map(s => (
                    <tr key={s.subjectId}>
                      <td style={{ fontWeight: '600' }}>{s.subjectName}</td>
                      <td>{s.total}</td>
                      <td>{s.present}</td>
                      <td><strong>{s.percentage}%</strong></td>
                      <td>{parseFloat(s.percentage) >= 75 ? <span className="badge badge-success">Good</span> : <span className="badge badge-danger">Low</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="card">
          <div className="flex flex-between flex-center mb-4">
            <h3>📅 Monthly Calendar</h3>
            <div className="flex gap-2">
              <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ padding: '8px 12px' }}>
                {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
              </select>
              <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ padding: '8px 12px' }}>
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '16px', height: '16px', background: '#d1fae5', borderRadius: '4px' }}></span> Present</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '16px', height: '16px', background: '#fee2e2', borderRadius: '4px' }}></span> Absent</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '16px', height: '16px', background: '#fef3c7', borderRadius: '4px' }}></span> Leave</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ textAlign: 'center', fontWeight: '600', color: '#64748b', padding: '8px' }}>{d}</div>)}
            {renderCalendar()}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📋 Attendance History</h3>
          {attendance.records.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No attendance records yet</p>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {attendance.records.slice(0, 20).map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.subject?.name || 'N/A'}</td>
                    <td>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📝 Leave Requests</h3>
          {leaveRequests.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No leave requests</p>
          ) : (
            <table>
              <thead><tr><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Remarks</th></tr></thead>
              <tbody>
                {leaveRequests.map(l => (
                  <tr key={l.id}>
                    <td>{l.startDate}</td>
                    <td>{l.endDate}</td>
                    <td>{l.reason}</td>
                    <td>{getStatusBadge(l.status)}</td>
                    <td>{l.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'remarks' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>💬 Teacher Remarks</h3>
          {remarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <p style={{ color: '#64748b', marginTop: '15px' }}>No remarks from teachers yet</p>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Teachers can add remarks on your attendance records</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {remarks.map(r => (
                <div key={r.id} style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  padding: '16px', 
                  borderRadius: '12px',
                  borderLeft: `4px solid ${r.status === 'absent' ? '#ef4444' : r.status === 'late' ? '#f59e0b' : '#10b981'}`
                }}>
                  <div className="flex flex-between flex-center" style={{ marginBottom: '8px' }}>
                    <div className="flex gap-2 flex-center">
                      <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                      <strong style={{ color: '#1e293b' }}>{r.teacher}</strong>
                    </div>
                    <div className="flex gap-2 flex-center">
                      {getStatusBadge(r.status)}
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                    <strong>Subject:</strong> {r.subject}
                  </div>
                  <div style={{ 
                    background: 'white', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    color: '#334155',
                    fontStyle: 'italic',
                    borderLeft: '3px solid #6366f1'
                  }}>
                    "{r.remarks}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
