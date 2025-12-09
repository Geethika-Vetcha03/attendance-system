import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    findAll(role?: UserRole): Promise<User[]>;
    findStudents(classId?: string): Promise<User[]>;
    findTeachers(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    assignClass(userId: string, classId: string): Promise<User>;
}
