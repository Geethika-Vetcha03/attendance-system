export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  classId?: string;
  class?: Class;
}

export interface Class {
  id: string;
  name: string;
  batch?: string;
  teacherId?: string;
  teacher?: User;
  students?: User[];
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  classId: string;
  class?: Class;
}

export interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  student?: User;
  subject?: Subject;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  student?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt: string;
}
