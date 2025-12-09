import { useEffect, useState } from 'react';
import { leaveApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';

export default function LeaveRequests() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [filter, setFilter] = useState('');

  const loadData = () => {
    if (user?.role === 'student') {
      leaveApi.getMyLeaves().then(res => setLeaves(res.data));
    } else {
      leaveApi.getAll(filter || undefined).then(res => setLeaves(res.data));
    }
  };

  useEffect(() => { loadData(); }, [filter, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await leaveApi.apply(form);
    setForm({ startDate: '', endDate: '', reason: '' });
    setShowForm(false);
    loadData();
  };

  const handleApprove = async (id: string) => { await leaveApi.approve(id); loadData(); };
  const handleReject = async (id: string) => { await leaveApi.reject(id); loadData(); };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${classes[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex flex-between flex-center mb-4">
        <h2>Leave Requests</h2>
        {user?.role === 'student' && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>Apply Leave</button>}
      </div>
      {showForm && (
        <div className="card mb-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3 gap-2">
              <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required /></div>
              <div className="form-group"><label>Reason</label><input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required /></div>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      )}
      <div className="card">
        {user?.role !== 'student' && (
          <div className="mb-2">
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '200px' }}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}
        <table>
          <thead><tr>{user?.role !== 'student' && <th>Student</th>}<th>Start</th><th>End</th><th>Reason</th><th>Status</th>{user?.role !== 'student' && <th>Actions</th>}</tr></thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                {user?.role !== 'student' && <td>{l.student?.name}</td>}
                <td>{l.startDate}</td><td>{l.endDate}</td><td>{l.reason}</td><td>{getStatusBadge(l.status)}</td>
                {user?.role !== 'student' && l.status === 'pending' && (
                  <td>
                    <button className="btn btn-success" onClick={() => handleApprove(l.id)}>Approve</button>
                    <button className="btn btn-danger" style={{ marginLeft: '5px' }} onClick={() => handleReject(l.id)}>Reject</button>
                  </td>
                )}
                {user?.role !== 'student' && l.status !== 'pending' && <td>-</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
