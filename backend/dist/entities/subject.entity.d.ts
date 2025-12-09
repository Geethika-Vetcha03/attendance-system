import { Class } from './class.entity';
import { Attendance } from './attendance.entity';
export declare class Subject {
    id: string;
    name: string;
    code: string;
    class: Class;
    classId: string;
    attendances: Attendance[];
    createdAt: Date;
}
