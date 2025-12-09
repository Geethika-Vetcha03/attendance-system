"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ExcelJS = __importStar(require("exceljs"));
const PDFDocument = __importStar(require("pdfkit"));
const attendance_entity_1 = require("../../entities/attendance.entity");
const user_entity_1 = require("../../entities/user.entity");
let ReportsService = class ReportsService {
    constructor(attendanceRepo, userRepo) {
        this.attendanceRepo = attendanceRepo;
        this.userRepo = userRepo;
    }
    async getDailyReport(date, classId) {
        const qb = this.attendanceRepo.createQueryBuilder('a')
            .leftJoinAndSelect('a.student', 's')
            .leftJoinAndSelect('a.subject', 'sub')
            .where('a.date = :date', { date });
        if (classId)
            qb.andWhere('s.classId = :classId', { classId });
        const records = await qb.getMany();
        const present = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.PRESENT).length;
        const absent = records.filter(r => r.status === attendance_entity_1.AttendanceStatus.ABSENT).length;
        return { date, records, summary: { total: records.length, present, absent } };
    }
    async getWeeklyReport(startDate, classId) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return this.getReportByRange(start, end, classId);
    }
    async getMonthlyReport(month, year, classId) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return this.getReportByRange(start, end, classId);
    }
    async getReportByRange(start, end, classId) {
        const qb = this.attendanceRepo.createQueryBuilder('a')
            .leftJoinAndSelect('a.student', 's')
            .leftJoinAndSelect('a.subject', 'sub')
            .where('a.date BETWEEN :start AND :end', { start, end });
        if (classId)
            qb.andWhere('s.classId = :classId', { classId });
        const records = await qb.getMany();
        const studentStats = new Map();
        records.forEach(r => {
            if (!studentStats.has(r.studentId))
                studentStats.set(r.studentId, { name: r.student?.name, total: 0, present: 0 });
            const stat = studentStats.get(r.studentId);
            stat.total++;
            if (r.status === attendance_entity_1.AttendanceStatus.PRESENT || r.status === attendance_entity_1.AttendanceStatus.LATE)
                stat.present++;
        });
        return { start, end, records, studentStats: Array.from(studentStats.values()).map(s => ({ ...s, percentage: ((s.present / s.total) * 100).toFixed(2) })) };
    }
    async exportToExcel(query) {
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
    async exportToPdf(query) {
        const start = query.startDate ? new Date(query.startDate) : new Date();
        const end = query.endDate ? new Date(query.endDate) : new Date();
        const report = await this.getReportByRange(start, end, query.classId);
        return new Promise((resolve) => {
            const doc = new PDFDocument();
            const chunks = [];
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map