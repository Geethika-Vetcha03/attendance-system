import { useEffect, useState } from 'react';
import { classesApi, subjectsApi, usersApi, attendanceApi } from '../services/api';
import { Class, Subject, User } from '../types';

export default function MarkAttendance() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingLoaded, setExistingLoaded] = useState(false);

  useEffect(() => { 
    classesApi.getAll().then(res => setClasses(res.data)).catch(err => console.error(err)); 
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setSelectedSubject('');
      setSubjects([]);
      setExistingLoaded(false);
      subjectsApi.getAll(selectedClass).then(res => {
        setSubjects(res.data);
      }).catch(err => console.error(err));
      
      usersApi.getStudents(selectedClass).then(res => {
        setStudents(res.data);
        const initial: Record<string, string> = {};
        res.data.forEach((s: User) => initial[s.id] = 'present');
        setAttendance(initial);
        setRemarks({});
      }).catch(err => console.error(err));
    } else {
      setSubjects([]);
      setStudents([]);
    }
  }, [selectedClass]);

  // Load existing attendance when subject or date changes
  useEffect(() => {
    if (selectedSubject && date && students.length > 0) {
      loadExistingAttendance();
    }
  }, [selectedSubject, date]);

  const loadExistingAttendance = async () => {
    try {
      const res = await attendanceApi.getSubjectAttendance(selectedSubject, { date });
      if (res.data && res.data.length > 0) {
        const existingAttendance: Record<string, string> = {};
        const existingRemarks: Record<string, string> = {};
        // First set all to present as default
        students.forEach(s => existingAttendance[s.id] = 'present');
        // Then override with existing records
        res.data.forEach((record: any) => {
          existingAttendance[record.studentId] = record.status;
          if (record.remarks) existingRemarks[record.studentId] = record.remarks;
        });
        setAttendance(existingAttendance);
        setRemarks(existingRemarks);
        setExistingLoaded(true);
      } else {
        // No existing records, set all to present
        const initial: Record<string, string> = {};
        students.forEach(s => initial[s.id] = 'present');
        setAttendance(initial);
        setRemarks({});
        setExistingLoaded(false);
      }
    } catch (err) {
      console.error('Error loading existing attendance:', err);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    if (!date) {
      setError('Please select a date');
      return;
    }
    if (students.length === 0) {
      setError('No students in this class');
      return;
    }

    setLoading(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ 
        studentId, 
        status,
        ...(remarks[studentId] ? { remarks: remarks[studentId] } : {})
      }));
      console.log('Submitting records:', records);
      await attendanceApi.bulkMark({ subjectId: selectedSubject, date, records });
      setMessage('✅ Attendance marked successfully!');
      setExistingLoaded(true);
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.message || 'Failed to mark attendance');
    }
    setLoading(false);
  };

  const getPresentCount = () => Object.values(attendance).filter(s => s === 'present').length;
  const getAbsentCount = () => Object.values(attendance).filter(s => s === 'absent').length;
  const getLateCount = () => Object.values(attendance).filter(s => s === 'late').length;

  return (
    <div>
      <div className="page-header">
        <h2>✅ Mark Attendance</h2>
      </div>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">❌ {error}</div>}
      
      <div className="card mb-4">
        <h3 style={{ marginBottom: '20px' }}>📋 Select Class & Subject</h3>
        <div className="grid grid-3 gap-2">
          <div className="form-group">
            <label>📚 Class *</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.batch ? `(${c.batch})` : ''}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>📖 Subject *</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
              <option value="">-- Select Subject --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>📅 Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        {existingLoaded && (
          <p style={{ color: '#10b981', fontSize: '13px', marginTop: '10px' }}>
            ✅ Loaded existing attendance for this date
          </p>
        )}
      </div>

      {students.length > 0 && selectedSubject && (
        <>
          <div className="grid grid-3 mb-4">
            <div className="card stat-card green" style={{ padding: '20px' }}>
              <h3>{getPresentCount()}</h3>
              <p>✅ Present</p>
            </div>
            <div className="card stat-card pink" style={{ padding: '20px' }}>
              <h3>{getAbsentCount()}</h3>
              <p>❌ Absent</p>
            </div>
            <div className="card stat-card orange" style={{ padding: '20px' }}>
              <h3>{getLateCount()}</h3>
              <p>⏰ Late</p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>👥 Students ({students.length})</h3>
            <table>
              <thead>
                <tr><th>Student Name</th><th>Email</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '500' }}>{s.name}</td>
                    <td style={{ color: '#64748b' }}>{s.email}</td>
                    <td>
                      <select 
                        value={attendance[s.id] || 'present'} 
                        onChange={e => setAttendance({ ...attendance, [s.id]: e.target.value })}
                        style={{ 
                          padding: '8px 12px',
                          backgroundColor: attendance[s.id] === 'present' ? '#d1fae5' : 
                                          attendance[s.id] === 'absent' ? '#fee2e2' : '#fef3c7',
                          fontWeight: '500'
                        }}
                      >
                        <option value="present">✅ Present</option>
                        <option value="absent">❌ Absent</option>
                        <option value="late">⏰ Late</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text"
                        placeholder="Add remark..."
                        value={remarks[s.id] || ''}
                        onChange={e => setRemarks({ ...remarks, [s.id]: e.target.value })}
                        style={{ padding: '8px 12px', width: '200px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '14px 28px', fontSize: '16px' }}
              >
                {loading ? '⏳ Submitting...' : '💾 Submit Attendance & Remarks'}
              </button>
            </div>
          </div>
        </>
      )}

      {students.length > 0 && !selectedSubject && (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            👆 Select a subject to mark attendance.
          </p>
        </div>
      )}

      {!selectedClass && (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            👆 Select a class to view students and mark attendance.
          </p>
        </div>
      )}
    </div>
  );
}
