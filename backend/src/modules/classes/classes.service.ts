import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../../entities/class.entity';
import { Subject } from '../../entities/subject.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(data: Partial<Class>) {
    // Handle empty teacherId - convert to null
    if (!data.teacherId || data.teacherId === '') {
      delete data.teacherId;
    }
    
    // Check for duplicate class with same name AND same teacher
    const where: any = { name: data.name };
    if (data.teacherId) {
      where.teacherId = data.teacherId;
    }
    const existing = await this.classRepo.findOne({ where });
    if (existing) {
      throw new ConflictException('Class with this name already exists for this teacher');
    }
    const cls = this.classRepo.create(data);
    return this.classRepo.save(cls);
  }

  findAll() {
    return this.classRepo.find({ relations: ['teacher', 'students', 'subjects'] });
  }

  async findOne(id: string) {
    const cls = await this.classRepo.findOne({ where: { id }, relations: ['teacher', 'students', 'subjects'] });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async update(id: string, data: Partial<Class>) {
    await this.classRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const cls = await this.findOne(id);
    
    // Remove students from this class (set classId to null)
    await this.userRepo.createQueryBuilder()
      .update()
      .set({ classId: () => 'NULL' })
      .where('classId = :id', { id })
      .execute();
    
    // Delete subjects in this class
    await this.subjectRepo.delete({ classId: id });
    
    // Delete the class
    await this.classRepo.delete(id);
    return { message: 'Class deleted successfully' };
  }
}
