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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_request_entity_1 = require("../../entities/leave-request.entity");
const attendance_entity_1 = require("../../entities/attendance.entity");
const notification_entity_1 = require("../../entities/notification.entity");
let LeaveService = class LeaveService {
    constructor(leaveRepo, attendanceRepo, notificationRepo) {
        this.leaveRepo = leaveRepo;
        this.attendanceRepo = attendanceRepo;
        this.notificationRepo = notificationRepo;
    }
    apply(data) {
        const leave = this.leaveRepo.create({ ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) });
        return this.leaveRepo.save(leave);
    }
    getStudentLeaves(studentId) {
        return this.leaveRepo.find({ where: { studentId }, order: { createdAt: 'DESC' } });
    }
    getAll(status) {
        const where = status ? { status: status } : {};
        return this.leaveRepo.find({ where, relations: ['student'], order: { createdAt: 'DESC' } });
    }
    async approve(id, approvedById, remarks) {
        const leave = await this.leaveRepo.findOne({ where: { id } });
        if (!leave)
            throw new common_1.NotFoundException('Leave request not found');
        leave.status = leave_request_entity_1.LeaveStatus.APPROVED;
        leave.approvedById = approvedById;
        if (remarks)
            leave.remarks = remarks;
        await this.leaveRepo.save(leave);
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            await this.attendanceRepo.update({ studentId: leave.studentId, date: new Date(d) }, { status: attendance_entity_1.AttendanceStatus.EXCUSED });
        }
        await this.notificationRepo.save({
            userId: leave.studentId,
            title: '✅ Leave Approved',
            message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been approved.${remarks ? ` Remarks: ${remarks}` : ''}`,
            type: 'leave_approved'
        });
        return leave;
    }
    async reject(id, approvedById, remarks) {
        const leave = await this.leaveRepo.findOne({ where: { id } });
        if (!leave)
            throw new common_1.NotFoundException('Leave request not found');
        leave.status = leave_request_entity_1.LeaveStatus.REJECTED;
        leave.approvedById = approvedById;
        if (remarks)
            leave.remarks = remarks;
        await this.leaveRepo.save(leave);
        await this.notificationRepo.save({
            userId: leave.studentId,
            title: '❌ Leave Rejected',
            message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
            type: 'leave_rejected'
        });
        return leave;
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveService);
//# sourceMappingURL=leave.service.js.map