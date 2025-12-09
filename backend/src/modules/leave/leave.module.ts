import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { Attendance } from '../../entities/attendance.entity';
import { Notification } from '../../entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, Attendance, Notification])],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
