"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../../entities/attendance.entity");
const user_entity_1 = require("../../entities/user.entity");
const notification_entity_1 = require("../../entities/notification.entity");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepo, userRepo, notificationRepo) {
        this.attendanceRepo = attendanceRepo;
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
    }
    async markAttendance(data, markedById) {
        const marker = await this.userRepo.findOne({ where: { id: markedById } });
        let record = await this.attendanceRepo.findOne({ where: { studentId: data.studentId, subjectId: data.subjectId, date: new Date(data.date) }, relations: ['subject'] });
        const isNew = !record;
        if (record) {
            record.status = data.status;
            record.markedAt = new Date();
            if (marker)
                record.markedById = markedById;
            if (data.remarks !== undefined)
                record.remarks = data.remarks;
        }
        else {
            record = this.attendanceRepo.create({
                ...data,
                date: new Date(data.date),
                markedAt: new Date(),
                ...(marker ? { markedById } : {}),
                ...(data.remarks ? { remarks: data.remarks } : {})
            });
        }
        await this.attendanceRepo.save(record);
        if (data.status === attendance_entity_1.AttendanceStatus.ABSENT && isNew) {
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
    async bulkMarkAttendance(data, markedById) {
        const results = [];
        for (const r of data.records) {
            const result = await this.markAttendance({ studentId: r.studentId, subjectId: data.subjectId, date: data.date, status: r.status, remarks: r.remarks }, markedById);
            results.push(result);
        }
        return results;
    }
    async getStudentAttendance(studentId, query) {
        const where = { studentId };
        if (query.subjectId)
            where.subjectId = query.subjectId;
        if (query.startDate && query.endDate)
            where.date = (0, typeorm_2.Between)(new Date(query.startDate), new Date(query.endDate));
        const records = await this.attendanceRepo.find({ where, relations: ['subject'], order: { date: 'DESC' } });
        const total = records.length;
        const present = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.PRESENT || r.status === attendance_entity_1.AttendanceStatus.LATE).length;
        const absent = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.ABSENT).length;
        const excused = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.EXCUSED).length;
        return { records, total, present, absent, excused, percentage: total ? ((present / total) * 100).toFixed(2) : 0 };
    }
    async getStudentSubjectWiseAttendance(studentId) {
        const records = await this.attendanceRepo.find({ where: { studentId }, relations: ['subject'] });
        const subjectMap = new Map();
        records.forEach(r => {
            if (!r.subject)
                return;
            if (!subjectMap.has(r.subjectId)) {
                subjectMap.set(r.subjectId, { name: r.subject.name, total: 0, present: 0 });
            }
            const stat = subjectMap.get(r.subjectId);
            stat.total++;
            if (r.status === attendance_entity_1.AttendanceStatus.PRESENT || r.status === attendance_entity_1.AttendanceStatus.LATE)
                stat.present++;
        });
        return Array.from(subjectMap.entries()).map(([id, stat]) => ({
            subjectId: id,
            subjectName: stat.name,
            total: stat.total,
            present: stat.present,
            percentage: stat.total ? ((stat.present / stat.total) * 100).toFixed(2) : '0'
        }));
    }
    async getStudentMonthlyAttendance(studentId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const records = await this.attendanceRepo.find({
            where: { studentId, date: (0, typeorm_2.Between)(startDate, endDate) },
            relations: ['subject'],
            order: { date: 'ASC' }
        });
        const calendar = {};
        records.forEach(r => {
            const dateKey = new Date(r.date).toISOString().split('T')[0];
            if (!calendar[dateKey])
                calendar[dateKey] = [];
            calendar[dateKey].push({ status: r.status, subject: r.subject?.name });
        });
        return { month, year, calendar, totalDays: endDate.getDate() };
    }
    async getStudentWeeklyProgress(studentId, weeks = 4) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeks * 7));
        const records = await this.attendanceRepo.find({
            where: { studentId, date: (0, typeorm_2.Between)(startDate, endDate) },
            order: { date: 'ASC' }
        });
        const weeklyData = [];
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const weekRecords = records.filter(r => {
                const d = new Date(r.date);
                return d >= weekStart && d <= weekEnd;
            });
            const present = weekRecords.filter(r => r.status === attendance_entity_1.AttendanceStatus.PRESENT || r.status === attendance_entity_1.AttendanceStatus.LATE).length;
            weeklyData.push({
                week: `Week ${i + 1}`,
                present,
                total: weekRecords.length,
                percentage: weekRecords.length ? Math.round((present / weekRecords.length) * 100) : 0
            });
        }
        return weeklyData;
    }
    async getClassAttendance(classId, query) {
        const students = await this.userRepo.find({ where: { classId, role: user_entity_1.UserRole.STUDENT } });
        const results = [];
        for (const student of students) {
            const attendance = await this.getStudentAttendance(student.id, query);
            results.push({ student: { id: student.id, name: student.name, email: student.email }, ...attendance });
        }
        return results;
    }
    async getSubjectAttendance(subjectId, query) {
        const where = { subjectId };
        if (query.date)
            where.date = new Date(query.date);
        return this.attendanceRepo.find({ where, relations: ['student'], order: { date: 'DESC' } });
    }
    async getAnalytics(query) {
        const qb = this.attendanceRepo.createQueryBuilder('a')
            .leftJoin('a.student', 's')
            .leftJoin('a.subject', 'sub');
        if (query.classId)
            qb.where('s.classId = :classId', { classId: query.classId });
        if (query.startDate && query.endDate)
            qb.andWhere('a.date BETWEEN :start AND :end', { start: query.startDate, end: query.endDate });
        const records = await qb.getMany();
        const total = records.length;
        const present = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.PRESENT || r.status === attendance_entity_1.AttendanceStatus.LATE).length;
        const absent = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.ABSENT).length;
        return { total, present, absent, percentage: total ? ((present / total) * 100).toFixed(2) : 0 };
    }
    async getStudentRemarks(studentId) {
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
    async addRemark(attendanceId, remarks, teacherId) {
        const record = await this.attendanceRepo.findOne({ where: { id: attendanceId } });
        if (!record)
            throw new Error('Attendance record not found');
        record.remarks = remarks;
        record.markedById = teacherId;
        await this.attendanceRepo.save(record);
        await this.notificationRepo.save({
            userId: record.studentId,
            title: 'New Teacher Remark',
            message: `A teacher added a remark on your attendance: "${remarks.substring(0, 50)}..."`,
            type: 'remark'
        });
        return record;
    }
    async checkLowAttendance(studentId) {
        const { percentage } = await this.getStudentAttendance(studentId, {});
        if (Number(percentage) < 75) {
            const exists = await this.notificationRepo.findOne({ where: { userId: studentId, type: 'low_attendance', isRead: false } });
            if (!exists) {
                await this.notificationRepo.save({ userId: studentId, title: '⚠️ Low Attendance Alert', message: `Your attendance is ${percentage}%. Please improve to avoid academic issues.`, type: 'low_attendance' });
            }
        }
        else {
            await this.notificationRepo.delete({ userId: studentId, type: 'low_attendance' });
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map