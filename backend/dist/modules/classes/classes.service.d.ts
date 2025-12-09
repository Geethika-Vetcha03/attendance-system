import { Repository } from 'typeorm';
import { Class } from '../../entities/class.entity';
import { Subject } from '../../entities/subject.entity';
import { User } from '../../entities/user.entity';
export declare class ClassesService {
    private classRepo;
    private subjectRepo;
    private userRepo;
    constructor(classRepo: Repository<Class>, subjectRepo: Repository<Subject>, userRepo: Repository<User>);
    create(data: Partial<Class>): Promise<Class>;
    findAll(): Promise<Class[]>;
    findOne(id: string): Promise<Class>;
    update(id: string, data: Partial<Class>): Promise<Class>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
