import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Attendance } from '../../entities/attendance.entity';
import { User } from '../../entities/user.entity';
import { Class } from '../../entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User, Class])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
