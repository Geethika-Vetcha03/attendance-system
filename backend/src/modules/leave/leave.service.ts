import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveStatus } from '../../entities/leave-request.entity';
import { Attendance, AttendanceStatus } from '../../entities/attendance.entity';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest) private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
  ) {}

  apply(data: { studentId: string; startDate: string; endDate: string; reason: string }) {
    const leave = this.leaveRepo.create({ ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) });
    return this.leaveRepo.save(leave);
  }

  getStudentLeaves(studentId: string) {
    return this.leaveRepo.find({ where: { studentId }, order: { createdAt: 'DESC' } });
  }

  getAll(status?: string) {
    const where = status ? { status: status as LeaveStatus } : {};
    return this.leaveRepo.find({ where, relations: ['student'], order: { createdAt: 'DESC' } });
  }

  async approve(id: string, approvedById: string, remarks?: string) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = LeaveStatus.APPROVED;
    leave.approvedById = approvedById;
    if (remarks) leave.remarks = remarks;
    await this.leaveRepo.save(leave);
    // Mark attendance as excused for leave dates
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      await this.attendanceRepo.update({ studentId: leave.studentId, date: new Date(d) }, { status: AttendanceStatus.EXCUSED });
    }
    // Notify student
    await this.notificationRepo.save({
      userId: leave.studentId,
      title: '✅ Leave Approved',
      message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been approved.${remarks ? ` Remarks: ${remarks}` : ''}`,
      type: 'leave_approved'
    });
    return leave;
  }

  async reject(id: string, approvedById: string, remarks?: string) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');
    leave.status = LeaveStatus.REJECTED;
    leave.approvedById = approvedById;
    if (remarks) leave.remarks = remarks;
    await this.leaveRepo.save(leave);
    // Notify student
    await this.notificationRepo.save({
      userId: leave.studentId,
      title: '❌ Leave Rejected',
      message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
      type: 'leave_rejected'
    });
    return leave;
  }
}
