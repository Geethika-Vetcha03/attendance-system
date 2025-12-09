import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const usersApi = {
  getAll: (role?: string) => api.get('/users', { params: { role } }),
  getStudents: (classId?: string) => api.get('/users/students', { params: { classId } }),
  getTeachers: () => api.get('/users/teachers'),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  assignClass: (id: string, classId: string) => api.put(`/users/${id}/assign-class`, { classId }),
};

export const classesApi = {
  getAll: () => api.get('/classes'),
  getOne: (id: string) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
};

export const subjectsApi = {
  getAll: (classId?: string) => api.get('/subjects', { params: { classId } }),
  create: (data: any) => api.post('/subjects', data),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

export const attendanceApi = {
  mark: (data: any) => api.post('/attendance/mark', data),
  bulkMark: (data: any) => api.post('/attendance/bulk', data),
  getStudentAttendance: (studentId: string, params?: any) => api.get(`/attendance/student/${studentId}`, { params }),
  getMyAttendance: (params?: any) => api.get('/attendance/my', { params }),
  getMySubjectWise: () => api.get('/attendance/my/subject-wise'),
  getMyMonthly: (month: number, year: number) => api.get('/attendance/my/monthly', { params: { month, year } }),
  getMyWeeklyProgress: (weeks?: number) => api.get('/attendance/my/weekly-progress', { params: { weeks } }),
  getMyRemarks: () => api.get('/attendance/my/remarks'),
  addRemark: (id: string, remarks: string) => api.post(`/attendance/${id}/remark`, { remarks }),
  getClassAttendance: (classId: string, params?: any) => api.get(`/attendance/class/${classId}`, { params }),
  getSubjectAttendance: (subjectId: string, params?: any) => api.get(`/attendance/subject/${subjectId}`, { params }),
  getAnalytics: (params?: any) => api.get('/attendance/analytics', { params }),
};

export const leaveApi = {
  apply: (data: any) => api.post('/leave', data),
  getMyLeaves: () => api.get('/leave/my'),
  getAll: (status?: string) => api.get('/leave', { params: { status } }),
  approve: (id: string, remarks?: string) => api.put(`/leave/${id}/approve`, { remarks }),
  reject: (id: string, remarks?: string) => api.put(`/leave/${id}/reject`, { remarks }),
};

export const reportsApi = {
  getDaily: (date: string, classId?: string) => api.get('/reports/daily', { params: { date, classId } }),
  getWeekly: (startDate: string, classId?: string) => api.get('/reports/weekly', { params: { startDate, classId } }),
  getMonthly: (month: number, year: number, classId?: string) => api.get('/reports/monthly', { params: { month, year, classId } }),
  exportExcel: (params: any) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params: any) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
