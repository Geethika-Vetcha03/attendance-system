import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { Attendance } from '../../entities/attendance.entity';
export declare class SubjectsService {
    private subjectRepo;
    private attendanceRepo;
    constructor(subjectRepo: Repository<Subject>, attendanceRepo: Repository<Attendance>);
    create(data: Partial<Subject>): Promise<Subject>;
    findAll(classId?: string): Promise<Subject[]>;
    findOne(id: string): Promise<Subject>;
    update(id: string, data: Partial<Subject>): Promise<Subject>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
