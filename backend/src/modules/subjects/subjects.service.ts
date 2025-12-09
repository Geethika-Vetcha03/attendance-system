import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { Attendance } from '../../entities/attendance.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
  ) {}

  async create(data: Partial<Subject>) {
    // Check for duplicate subject in the same class
    const existing = await this.subjectRepo.findOne({ 
      where: { name: data.name, classId: data.classId } 
    });
    if (existing) {
      throw new ConflictException('Subject with this name already exists in this class');
    }
    const subject = this.subjectRepo.create(data);
    return this.subjectRepo.save(subject);
  }

  findAll(classId?: string) {
    const where = classId ? { classId } : {};
    return this.subjectRepo.find({ where, relations: ['class'] });
  }

  async findOne(id: string) {
    const subject = await this.subjectRepo.findOne({ where: { id }, relations: ['class'] });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(id: string, data: Partial<Subject>) {
    await this.subjectRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    // Delete related attendance records first
    await this.attendanceRepo.delete({ subjectId: id });
    // Then delete the subject
    await this.subjectRepo.delete(id);
    return { message: 'Subject deleted' };
  }
}
