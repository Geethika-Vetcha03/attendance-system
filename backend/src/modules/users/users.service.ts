import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  findAll(role?: UserRole) {
    const where = role ? { role } : {};
    return this.userRepo.find({ where, relations: ['class'], select: ['id', 'email', 'name', 'role', 'phone', 'classId', 'createdAt'] });
  }

  findStudents(classId?: string) {
    const where: any = { role: UserRole.STUDENT };
    if (classId) where.classId = classId;
    return this.userRepo.find({ where, relations: ['class'] });
  }

  findTeachers() {
    return this.userRepo.find({ where: { role: UserRole.TEACHER } });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['class'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: Partial<User>) {
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.userRepo.delete(id);
    return { message: 'User deleted' };
  }

  async assignClass(userId: string, classId: string) {
    await this.userRepo.update(userId, { classId });
    return this.findOne(userId);
  }
}
