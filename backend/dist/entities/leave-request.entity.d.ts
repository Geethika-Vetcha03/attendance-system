import { User } from './user.entity';
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class LeaveRequest {
    id: string;
    student: User;
    studentId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: LeaveStatus;
    approvedBy: User;
    approvedById: string;
    remarks: string;
    createdAt: Date;
}
