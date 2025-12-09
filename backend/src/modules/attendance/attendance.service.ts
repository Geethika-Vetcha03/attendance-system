import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
  ) {}

  async markAttendance(data: { studentId: string; subjectId: string; date: string; status: AttendanceStatus; remarks?: string }, markedById: string) {
    // Verify the markedById user exists
    const marker = await this.userRepo.findOne({ where: { id: markedById } });
    
    let record = await this.attendanceRepo.findOne({ where: { studentId: data.studentId, subjectId: data.subjectId, date: new Date(data.date) }, relations: ['subject'] });
    const isNew = !record;
    if (record) {
      record.status = data.status;
      record.markedAt = new Date();
      if (marker) record.markedById = markedById;
      if (data.remarks !== undefined) record.remarks = data.remarks;
    } else {
      record = this.attendanceRepo.create({ 
        ...data, 
        date: new Date(data.date), 
        markedAt: new Date(), 
        ...(marker ? { markedById } : {}),
        ...(data.remarks ? { remarks: data.remarks } : {})
      });
    }
    await this.attendanceRepo.save(record);
    
    // Notify student if marked absent
    if (data.status === AttendanceStatus.ABSENT && isNew) {
      const subject = record.subject || await this.attendanceRepo.findOne({ where: { id: record.id }, relations: ['subject'] }).then(r => r?.subject);
      await this.notificationRepo.save({
        userId: data.studentId,
        title: '❌ Marked Absent',
        message: `You were marked absent for ${subject?.name || 'a class'} on ${new Date(data.date).toLocaleDateString()}.`,
        type: 'absent'
      });
    }
    
    await this.checkLowAttendance(data.studentId);
    return record;
  }

  async bulkMarkAttendance(data: { subjectId: string; date: string; records: { studentId: string; status: AttendanceStatus; remarks?: string }[] }, markedById: string) {
    const results: Attendance[] = [];
    for (const r of data.records) {
      const result = await this.markAttendance({ studentId: r.studentId, subjectId: data.subjectId, date: data.date, status: r.status, remarks: r.remarks }, markedById);
      results.push(result);
    }
    return results;
  }

  async getStudentAttendance(studentId: string, query: { startDate?: string; endDate?: string; subjectId?: string }) {
    const where: any = { studentId };
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.startDate && query.endDate) where.date = Between(new Date(query.startDate), new Date(query.endDate));
    const records = await this.attendanceRepo.find({ where, relations: ['subject'], order: { date: 'DESC' } });
    const total = records.length;
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const excused = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    return { records, total, present, absent, excused, percentage: total ? ((present / total) * 100).toFixed(2) : 0 };
  }

  async getStudentSubjectWiseAttendance(studentId: string) {
    const records = await this.attendanceRepo.find({ where: { studentId }, relations: ['subject'] });
    const subjectMap = new Map<string, { name: string; total: number; present: number }>();
    
    records.forEach(r => {
      if (!r.subject) return;
      if (!subjectMap.has(r.subjectId)) {
        subjectMap.set(r.subjectId, { name: r.subject.name, total: 0, present: 0 });
      }
      const stat = subjectMap.get(r.subjectId)!;
      stat.total++;
      if (r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE) stat.present++;
    });

    return Array.from(subjectMap.entries()).map(([id, stat]) => ({
      subjectId: id,
      subjectName: stat.name,
      total: stat.total,
      present: stat.present,
      percentage: stat.total ? ((stat.present / stat.total) * 100).toFixed(2) : '0'
    }));
  }

  async getStudentMonthlyAttendance(studentId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const records = await this.attendanceRepo.find({
      where: { studentId, date: Between(startDate, endDate) },
      relations: ['subject'],
      order: { date: 'ASC' }
    });
    
    const calendar: Record<string, { status: string; subject?: string }[]> = {};
    records.forEach(r => {
      const dateKey = new Date(r.date).toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push({ status: r.status, subject: r.subject?.name });
    });
    
    return { month, year, calendar, totalDays: endDate.getDate() };
  }

  async getStudentWeeklyProgress(studentId: string, weeks: number = 4) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    
    const records = await this.attendanceRepo.find({
      where: { studentId, date: Between(startDate, endDate) },
      order: { date: 'ASC' }
    });

    const weeklyData: { week: string; present: number; total: number; percentage: number }[] = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekRecords = records.filter(r => {
        const d = new Date(r.date);
        return d >= weekStart && d <= weekEnd;
      });
      
      const present = weekRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
      weeklyData.push({
        week: `Week ${i + 1}`,
        present,
        total: weekRecords.length,
        percentage: weekRecords.length ? Math.round((present / weekRecords.length) * 100) : 0
      });
    }
    
    return weeklyData;
  }


  async getClassAttendance(classId: string, query: { date?: string; startDate?: string; endDate?: string }) {
    const students = await this.userRepo.find({ where: { classId, role: UserRole.STUDENT } });
    const results: { student: { id: string; name: string; email: string }; records: Attendance[]; total: number; present: number; percentage: string | number }[] = [];
    for (const student of students) {
      const attendance = await this.getStudentAttendance(student.id, query);
      results.push({ student: { id: student.id, name: student.name, email: student.email }, ...attendance });
    }
    return results;
  }

  async getSubjectAttendance(subjectId: string, query: { date?: string }) {
    const where: any = { subjectId };
    if (query.date) where.date = new Date(query.date);
    return this.attendanceRepo.find({ where, relations: ['student'], order: { date: 'DESC' } });
  }

  async getAnalytics(query: { classId?: string; startDate?: string; endDate?: string }) {
    const qb = this.attendanceRepo.createQueryBuilder('a')
      .leftJoin('a.student', 's')
      .leftJoin('a.subject', 'sub');
    if (query.classId) qb.where('s.classId = :classId', { classId: query.classId });
    if (query.startDate && query.endDate) qb.andWhere('a.date BETWEEN :start AND :end', { start: query.startDate, end: query.endDate });
    const records = await qb.getMany();
    const total = records.length;
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    return { total, present, absent, percentage: total ? ((present / total) * 100).toFixed(2) : 0 };
  }

  async getStudentRemarks(studentId: string) {
    const records = await this.attendanceRepo.find({
      where: { studentId },
      relations: ['subject', 'markedBy'],
      order: { date: 'DESC' }
    });
    return records
      .filter(r => r.remarks)
      .map(r => ({
        id: r.id,
        date: r.date,
        subject: r.subject?.name || 'N/A',
        status: r.status,
        remarks: r.remarks,
        teacher: r.markedBy?.name || 'Unknown'
      }));
  }

  async addRemark(attendanceId: string, remarks: string, teacherId: string) {
    const record = await this.attendanceRepo.findOne({ where: { id: attendanceId } });
    if (!record) throw new Error('Attendance record not found');
    record.remarks = remarks;
    record.markedById = teacherId;
    await this.attendanceRepo.save(record);
    
    // Notify student
    await this.notificationRepo.save({
      userId: record.studentId,
      title: 'New Teacher Remark',
      message: `A teacher added a remark on your attendance: "${remarks.substring(0, 50)}..."`,
      type: 'remark'
    });
    return record;
  }

  private async checkLowAttendance(studentId: string) {
    const { percentage } = await this.getStudentAttendance(studentId, {});
    if (Number(percentage) < 75) {
      // Create low attendance notification if doesn't exist
      const exists = await this.notificationRepo.findOne({ where: { userId: studentId, type: 'low_attendance', isRead: false } });
      if (!exists) {
        await this.notificationRepo.save({ userId: studentId, title: '⚠️ Low Attendance Alert', message: `Your attendance is ${percentage}%. Please improve to avoid academic issues.`, type: 'low_attendance' });
      }
    } else {
      // Remove low attendance notifications when attendance improves above 75%
      await this.notificationRepo.delete({ userId: studentId, type: 'low_attendance' });
    }
  }
}
