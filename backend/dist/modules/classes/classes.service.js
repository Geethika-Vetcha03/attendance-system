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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("../../entities/class.entity");
const subject_entity_1 = require("../../entities/subject.entity");
const user_entity_1 = require("../../entities/user.entity");
let ClassesService = class ClassesService {
    constructor(classRepo, subjectRepo, userRepo) {
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
        this.userRepo = userRepo;
    }
    async create(data) {
        if (!data.teacherId || data.teacherId === '') {
            delete data.teacherId;
        }
        const where = { name: data.name };
        if (data.teacherId) {
            where.teacherId = data.teacherId;
        }
        const existing = await this.classRepo.findOne({ where });
        if (existing) {
            throw new common_1.ConflictException('Class with this name already exists for this teacher');
        }
        const cls = this.classRepo.create(data);
        return this.classRepo.save(cls);
    }
    findAll() {
        return this.classRepo.find({ relations: ['teacher', 'students', 'subjects'] });
    }
    async findOne(id) {
        const cls = await this.classRepo.findOne({ where: { id }, relations: ['teacher', 'students', 'subjects'] });
        if (!cls)
            throw new common_1.NotFoundException('Class not found');
        return cls;
    }
    async update(id, data) {
        await this.classRepo.update(id, data);
        return this.findOne(id);
    }
    async remove(id) {
        const cls = await this.findOne(id);
        await this.userRepo.createQueryBuilder()
            .update()
            .set({ classId: () => 'NULL' })
            .where('classId = :id', { id })
            .execute();
        await this.subjectRepo.delete({ classId: id });
        await this.classRepo.delete(id);
        return { message: 'Class deleted successfully' };
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClassesService);
//# sourceMappingURL=classes.service.js.map