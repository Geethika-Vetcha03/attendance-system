import { Repository } from 'typeorm';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { Attendance } from '../../entities/attendance.entity';
import { Notification } from '../../entities/notification.entity';
export declare class LeaveService {
    private leaveRepo;
    private attendanceRepo;
    private notificationRepo;
    constructor(leaveRepo: Repository<LeaveRequest>, attendanceRepo: Repository<Attendance>, notificationRepo: Repository<Notification>);
    apply(data: {
        studentId: string;
        startDate: string;
        endDate: string;
        reason: string;
    }): Promise<LeaveRequest>;
    getStudentLeaves(studentId: string): Promise<LeaveRequest[]>;
    getAll(status?: string): Promise<LeaveRequest[]>;
    approve(id: string, approvedById: string, remarks?: string): Promise<LeaveRequest>;
    reject(id: string, approvedById: string, remarks?: string): Promise<LeaveRequest>;
}
