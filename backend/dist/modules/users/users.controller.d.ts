import { UsersService } from './users.service';
import { UserRole } from '../../entities/user.entity';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole): Promise<import("../../entities/user.entity").User[]>;
    findStudents(classId?: string): Promise<import("../../entities/user.entity").User[]>;
    findTeachers(): Promise<import("../../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../../entities/user.entity").User>;
    update(id: string, data: any): Promise<import("../../entities/user.entity").User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    assignClass(id: string, classId: string): Promise<import("../../entities/user.entity").User>;
}
