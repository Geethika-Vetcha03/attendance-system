import { User } from './user.entity';
import { Subject } from './subject.entity';
export declare enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late",
    EXCUSED = "excused"
}
export declare class Attendance {
    id: string;
    student: User;
    studentId: string;
    subject: Subject;
    subjectId: string;
    date: Date;
    status: AttendanceStatus;
    markedAt: Date;
    markedBy: User;
    markedById: string;
    remarks: string;
    createdAt: Date;
}
