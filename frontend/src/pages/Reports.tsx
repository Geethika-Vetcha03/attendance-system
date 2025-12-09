import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { reportsApi, classesApi } from '../services/api';
import { Class } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Reports() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<any>(null);

  useEffect(() => { classesApi.getAll().then(res => setClasses(res.data)); }, []);

  const fetchReport = async () => {
    let res;
    if (reportType === 'daily') res = await reportsApi.getDaily(date, selectedClass || undefined);
    else if (reportType === 'weekly') res = await reportsApi.getWeekly(date, selectedClass || undefined);
    else res = await reportsApi.getMonthly(month, year, selectedClass || undefined);
    setReport(res.data);
  };

  const exportExcel = async () => {
    const params = reportType === 'monthly' ? { month, year, classId: selectedClass } : { startDate: date, endDate: date, classId: selectedClass };
    const res = await reportsApi.exportExcel(params);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a'); link.href = url; link.download = 'attendance_report.xlsx'; link.click();
  };

  const exportPdf = async () => {
    const params = reportType === 'monthly' ? { month, year, classId: selectedClass } : { startDate: date, endDate: date, classId: selectedClass };
    const res = await reportsApi.exportPdf(params);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a'); link.href = url; link.download = 'attendance_report.pdf'; link.click();
  };

  const chartData = report?.studentStats ? {
    labels: report.studentStats.map((s: any) => s.name),
    datasets: [{ label: 'Attendance %', data: report.studentStats.map((s: any) => parseFloat(s.percentage)), backgroundColor: '#4f46e5' }],
  } : null;

  return (
    <div>
      <h2 className="mb-4">Attendance Reports</h2>
      <div className="card mb-4">
        <div className="grid grid-4 gap-2">
          <div className="form-group"><label>Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group"><label>Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {reportType !== 'monthly' && <div className="form-group"><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>}
          {reportType === 'monthly' && (
            <>
              <div className="form-group"><label>Month</label><input type="number" min="1" max="12" value={month} onChange={e => setMonth(parseInt(e.target.value))} /></div>
              <div className="form-group"><label>Year</label><input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} /></div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={fetchReport}>Generate Report</button>
          <button className="btn btn-success" onClick={exportExcel}>Export Excel</button>
          <button className="btn btn-danger" onClick={exportPdf}>Export PDF</button>
        </div>
      </div>
      {report && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="mb-2">Summary</h3>
            {report.summary && <p>Total: {report.summary.total} | Present: {report.summary.present} | Absent: {report.summary.absent}</p>}
            {report.studentStats && (
              <table>
                <thead><tr><th>Student</th><th>Total</th><th>Present</th><th>%</th></tr></thead>
                <tbody>
                  {report.studentStats.map((s: any, i: number) => (
                    <tr key={i}><td>{s.name}</td><td>{s.total}</td><td>{s.present}</td><td>{s.percentage}%</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {chartData && (
            <div className="card">
              <h3 className="mb-2">Attendance Chart</h3>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
