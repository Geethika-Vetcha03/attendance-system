import { LeaveService } from './leave.service';
export declare class LeaveController {
    private leaveService;
    constructor(leaveService: LeaveService);
    apply(data: any, req: any): Promise<import("../../entities").LeaveRequest>;
    getMyLeaves(req: any): Promise<import("../../entities").LeaveRequest[]>;
    getAll(status?: string): Promise<import("../../entities").LeaveRequest[]>;
    approve(id: string, data: any, req: any): Promise<import("../../entities").LeaveRequest>;
    reject(id: string, data: any, req: any): Promise<import("../../entities").LeaveRequest>;
}
