import { Attendance } from './attendance.entity';
import { LeaveRequest } from './leave-request.entity';
import { Notification } from './notification.entity';
import { Class } from './class.entity';
export declare enum UserRole {
    ADMIN = "admin",
    TEACHER = "teacher",
    STUDENT = "student"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone: string;
    class: Class;
    classId: string;
    attendances: Attendance[];
    leaveRequests: LeaveRequest[];
    notifications: Notification[];
    createdAt: Date;
}
