import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { User } from '../../entities/user.entity';
import { Notification } from '../../entities/notification.entity';
export declare class AttendanceService {
    private attendanceRepo;
    private userRepo;
    private notificationRepo;
    constructor(attendanceRepo: Repository<Attendance>, userRepo: Repository<User>, notificationRepo: Repository<Notification>);
    markAttendance(data: {
        studentId: string;
        subjectId: string;
        date: string;
        status: AttendanceStatus;
        remarks?: string;
    }, markedById: string): Promise<Attendance>;
    bulkMarkAttendance(data: {
        subjectId: string;
        date: string;
        records: {
            studentId: string;
            status: AttendanceStatus;
            remarks?: string;
        }[];
    }, markedById: string): Promise<Attendance[]>;
    getStudentAttendance(studentId: string, query: {
        startDate?: string;
        endDate?: string;
        subjectId?: string;
    }): Promise<{
        records: Attendance[];
        total: number;
        present: number;
        absent: number;
        excused: number;
        percentage: string | number;
    }>;
    getStudentSubjectWiseAttendance(studentId: string): Promise<{
        subjectId: string;
        subjectName: string;
        total: number;
        present: number;
        percentage: string;
    }[]>;
    getStudentMonthlyAttendance(studentId: string, month: number, year: number): Promise<{
        month: number;
        year: number;
        calendar: Record<string, {
            status: string;
            subject?: string;
        }[]>;
        totalDays: number;
    }>;
    getStudentWeeklyProgress(studentId: string, weeks?: number): Promise<{
        week: string;
        present: number;
        total: number;
        percentage: number;
    }[]>;
    getClassAttendance(classId: string, query: {
        date?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        student: {
            id: string;
            name: string;
            email: string;
        };
        records: Attendance[];
        total: number;
        present: number;
        percentage: string | number;
    }[]>;
    getSubjectAttendance(subjectId: string, query: {
        date?: string;
    }): Promise<Attendance[]>;
    getAnalytics(query: {
        classId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        total: number;
        present: number;
        absent: number;
        percentage: string | number;
    }>;
    getStudentRemarks(studentId: string): Promise<{
        id: string;
        date: Date;
        subject: string;
        status: AttendanceStatus;
        remarks: string;
        teacher: string;
    }[]>;
    addRemark(attendanceId: string, remarks: string, teacherId: string): Promise<Attendance>;
    private checkLowAttendance;
}
