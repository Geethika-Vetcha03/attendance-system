import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getDailyReport(date: string, classId?: string): Promise<{
        date: string;
        records: import("../../entities").Attendance[];
        summary: {
            total: number;
            present: number;
            absent: number;
        };
    }>;
    getWeeklyReport(startDate: string, classId?: string): Promise<{
        start: Date;
        end: Date;
        records: import("../../entities").Attendance[];
        studentStats: any[];
    }>;
    getMonthlyReport(month: string, year: string, classId?: string): Promise<{
        start: Date;
        end: Date;
        records: import("../../entities").Attendance[];
        studentStats: any[];
    }>;
    exportExcel(query: any, res: Response): Promise<void>;
    exportPdf(query: any, res: Response): Promise<void>;
}
