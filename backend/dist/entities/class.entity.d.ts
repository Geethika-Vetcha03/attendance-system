import { User } from './user.entity';
import { Subject } from './subject.entity';
export declare class Class {
    id: string;
    name: string;
    batch: string;
    description: string;
    teacher: User;
    teacherId: string;
    students: User[];
    subjects: Subject[];
    createdAt: Date;
}
