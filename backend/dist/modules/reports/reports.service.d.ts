import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Attendance } from '../../entities/attendance.entity';
import { User } from '../../entities/user.entity';
export declare class ReportsService {
    private attendanceRepo;
    private userRepo;
    constructor(attendanceRepo: Repository<Attendance>, userRepo: Repository<User>);
    getDailyReport(date: string, classId?: string): Promise<{
        date: string;
        records: Attendance[];
        summary: {
            total: number;
            present: number;
            absent: number;
        };
    }>;
    getWeeklyReport(startDate: string, classId?: string): Promise<{
        start: Date;
        end: Date;
        records: Attendance[];
        studentStats: any[];
    }>;
    getMonthlyReport(month: number, year: number, classId?: string): Promise<{
        start: Date;
        end: Date;
        records: Attendance[];
        studentStats: any[];
    }>;
    private getReportByRange;
    exportToExcel(query: {
        startDate?: string;
        endDate?: string;
        classId?: string;
    }): Promise<ExcelJS.Buffer>;
    exportToPdf(query: {
        startDate?: string;
        endDate?: string;
        classId?: string;
    }): Promise<Buffer>;
}
