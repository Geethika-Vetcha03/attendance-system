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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subject_entity_1 = require("../../entities/subject.entity");
const attendance_entity_1 = require("../../entities/attendance.entity");
let SubjectsService = class SubjectsService {
    constructor(subjectRepo, attendanceRepo) {
        this.subjectRepo = subjectRepo;
        this.attendanceRepo = attendanceRepo;
    }
    async create(data) {
        const existing = await this.subjectRepo.findOne({
            where: { name: data.name, classId: data.classId }
        });
        if (existing) {
            throw new common_1.ConflictException('Subject with this name already exists in this class');
        }
        const subject = this.subjectRepo.create(data);
        return this.subjectRepo.save(subject);
    }
    findAll(classId) {
        const where = classId ? { classId } : {};
        return this.subjectRepo.find({ where, relations: ['class'] });
    }
    async findOne(id) {
        const subject = await this.subjectRepo.findOne({ where: { id }, relations: ['class'] });
        if (!subject)
            throw new common_1.NotFoundException('Subject not found');
        return subject;
    }
    async update(id, data) {
        await this.subjectRepo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        await this.attendanceRepo.delete({ subjectId: id });
        await this.subjectRepo.delete(id);
        return { message: 'Subject deleted' };
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(1, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map