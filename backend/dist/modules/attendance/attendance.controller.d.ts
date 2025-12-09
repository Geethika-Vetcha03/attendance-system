import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    markAttendance(data: any, req: any): Promise<import("../../entities").Attendance>;
    bulkMark(data: any, req: any): Promise<import("../../entities").Attendance[]>;
    getStudentAttendance(studentId: string, query: any): Promise<{
        records: import("../../entities").Attendance[];
        total: number;
        present: number;
        absent: number;
        excused: number;
        percentage: string | number;
    }>;
    getMyAttendance(req: any, query: any): Promise<{
        records: import("../../entities").Attendance[];
        total: number;
        present: number;
        absent: number;
        excused: number;
        percentage: string | number;
    }>;
    getMySubjectWiseAttendance(req: any): Promise<{
        subjectId: string;
        subjectName: string;
        total: number;
        present: number;
        percentage: string;
    }[]>;
    getMyMonthlyAttendance(req: any, month: string, year: string): Promise<{
        month: number;
        year: number;
        calendar: Record<string, {
            status: string;
            subject?: string;
        }[]>;
        totalDays: number;
    }>;
    getMyWeeklyProgress(req: any, weeks?: string): Promise<{
        week: string;
        present: number;
        total: number;
        percentage: number;
    }[]>;
    getMyRemarks(req: any): Promise<{
        id: string;
        date: Date;
        subject: string;
        status: import("../../entities").AttendanceStatus;
        remarks: string;
        teacher: string;
    }[]>;
    addRemark(id: string, remarks: string, req: any): Promise<import("../../entities").Attendance>;
    getClassAttendance(classId: string, query: any): Promise<{
        student: {
            id: string;
            name: string;
            email: string;
        };
        records: import("../../entities").Attendance[];
        total: number;
        present: number;
        percentage: string | number;
    }[]>;
    getSubjectAttendance(subjectId: string, query: any): Promise<import("../../entities").Attendance[]>;
    getAnalytics(query: any): Promise<{
        total: number;
        present: number;
        absent: number;
        percentage: string | number;
    }>;
}
