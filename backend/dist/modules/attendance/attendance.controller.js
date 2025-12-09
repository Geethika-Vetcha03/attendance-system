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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const user_entity_1 = require("../../entities/user.entity");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    markAttendance(data, req) {
        return this.attendanceService.markAttendance(data, req.user.sub);
    }
    bulkMark(data, req) {
        return this.attendanceService.bulkMarkAttendance(data, req.user.sub);
    }
    getStudentAttendance(studentId, query) {
        return this.attendanceService.getStudentAttendance(studentId, query);
    }
    getMyAttendance(req, query) {
        return this.attendanceService.getStudentAttendance(req.user.sub, query);
    }
    getMySubjectWiseAttendance(req) {
        return this.attendanceService.getStudentSubjectWiseAttendance(req.user.sub);
    }
    getMyMonthlyAttendance(req, month, year) {
        return this.attendanceService.getStudentMonthlyAttendance(req.user.sub, parseInt(month), parseInt(year));
    }
    getMyWeeklyProgress(req, weeks) {
        return this.attendanceService.getStudentWeeklyProgress(req.user.sub, weeks ? parseInt(weeks) : 4);
    }
    getMyRemarks(req) {
        return this.attendanceService.getStudentRemarks(req.user.sub);
    }
    addRemark(id, remarks, req) {
        return this.attendanceService.addRemark(id, remarks, req.user.sub);
    }
    getClassAttendance(classId, query) {
        return this.attendanceService.getClassAttendance(classId, query);
    }
    getSubjectAttendance(subjectId, query) {
        return this.attendanceService.getSubjectAttendance(subjectId, query);
    }
    getAnalytics(query) {
        return this.attendanceService.getAnalytics(query);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('mark'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "markAttendance", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "bulkMark", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getStudentAttendance", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMyAttendance", null);
__decorate([
    (0, common_1.Get)('my/subject-wise'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMySubjectWiseAttendance", null);
__decorate([
    (0, common_1.Get)('my/monthly'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMyMonthlyAttendance", null);
__decorate([
    (0, common_1.Get)('my/weekly-progress'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('weeks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMyWeeklyProgress", null);
__decorate([
    (0, common_1.Get)('my/remarks'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getMyRemarks", null);
__decorate([
    (0, common_1.Post)(':id/remark'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('remarks')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "addRemark", null);
__decorate([
    (0, common_1.Get)('class/:classId'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getClassAttendance", null);
__decorate([
    (0, common_1.Get)('subject/:subjectId'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Param)('subjectId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getSubjectAttendance", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, roles_guard_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.TEACHER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getAnalytics", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map