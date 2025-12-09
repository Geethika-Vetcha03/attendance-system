import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getDailyReport(date: string, classId?: string) {
    const qb = this.attendanceRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 's')
      .leftJoinAndSelect('a.subject', 'sub')
      .where('a.date = :date', { date });
    if (classId) qb.andWhere('s.classId = :classId', { classId });
    const records = await qb.getMany();
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    return { date, records, summary: { total: records.length, present, absent } };
  }

  async getWeeklyReport(startDate: string, classId?: string) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return this.getReportByRange(start, end, classId);
  }

  async getMonthlyReport(month: number, year: number, classId?: string) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return this.getReportByRange(start, end, classId);
  }

  private async getReportByRange(start: Date, end: Date, classId?: string) {
    const qb = this.attendanceRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 's')
      .leftJoinAndSelect('a.subject', 'sub')
      .where('a.date BETWEEN :start AND :end', { start, end });
    if (classId) qb.andWhere('s.classId = :classId', { classId });
    const records = await qb.getMany();
    const studentStats = new Map();
    records.forEach(r => {
      if (!studentStats.has(r.studentId)) studentStats.set(r.studentId, { name: r.student?.name, total: 0, present: 0 });
      const stat = studentStats.get(r.studentId);
      stat.total++;
      if (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE) stat.present++;
    });
    return { start, end, records, studentStats: Array.from(studentStats.values()).map(s => ({ ...s, percentage: ((s.present / s.total) * 100).toFixed(2) })) };
  }


  async exportToExcel(query: { startDate?: string; endDate?: string; classId?: string }) {
    const start = query.startDate ? new Date(query.startDate) : new Date();
    const end = query.endDate ? new Date(query.endDate) : new Date();
    const report = await this.getReportByRange(start, end, query.classId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');
    sheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Total Classes', key: 'total', width: 15 },
      { header: 'Present', key: 'present', width: 15 },
      { header: 'Percentage', key: 'percentage', width: 15 },
    ];
    report.studentStats.forEach(s => sheet.addRow(s));
    return workbook.xlsx.writeBuffer();
  }

  async exportToPdf(query: { startDate?: string; endDate?: string; classId?: string }): Promise<Buffer> {
    const start = query.startDate ? new Date(query.startDate) : new Date();
    const end = query.endDate ? new Date(query.endDate) : new Date();
    const report = await this.getReportByRange(start, end, query.classId);
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.fontSize(18).text('Attendance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${start.toDateString()} - ${end.toDateString()}`);
      doc.moveDown();
      report.studentStats.forEach(s => {
        doc.text(`${s.name}: ${s.present}/${s.total} (${s.percentage}%)`);
      });
      doc.end();
    });
  }
}
