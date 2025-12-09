import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  markAttendance(@Body() data: any, @Request() req) {
    return this.attendanceService.markAttendance(data, req.user.sub);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  bulkMark(@Body() data: any, @Request() req) {
    return this.attendanceService.bulkMarkAttendance(data, req.user.sub);
  }

  @Get('student/:studentId')
  getStudentAttendance(@Param('studentId') studentId: string, @Query() query: any) {
    return this.attendanceService.getStudentAttendance(studentId, query);
  }

  @Get('my')
  getMyAttendance(@Request() req, @Query() query: any) {
    return this.attendanceService.getStudentAttendance(req.user.sub, query);
  }

  @Get('my/subject-wise')
  getMySubjectWiseAttendance(@Request() req) {
    return this.attendanceService.getStudentSubjectWiseAttendance(req.user.sub);
  }

  @Get('my/monthly')
  getMyMonthlyAttendance(@Request() req, @Query('month') month: string, @Query('year') year: string) {
    return this.attendanceService.getStudentMonthlyAttendance(req.user.sub, parseInt(month), parseInt(year));
  }

  @Get('my/weekly-progress')
  getMyWeeklyProgress(@Request() req, @Query('weeks') weeks?: string) {
    return this.attendanceService.getStudentWeeklyProgress(req.user.sub, weeks ? parseInt(weeks) : 4);
  }

  @Get('my/remarks')
  getMyRemarks(@Request() req) {
    return this.attendanceService.getStudentRemarks(req.user.sub);
  }

  @Post(':id/remark')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  addRemark(@Param('id') id: string, @Body('remarks') remarks: string, @Request() req) {
    return this.attendanceService.addRemark(id, remarks, req.user.sub);
  }

  @Get('class/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getClassAttendance(@Param('classId') classId: string, @Query() query: any) {
    return this.attendanceService.getClassAttendance(classId, query);
  }

  @Get('subject/:subjectId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getSubjectAttendance(@Param('subjectId') subjectId: string, @Query() query: any) {
    return this.attendanceService.getSubjectAttendance(subjectId, query);
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getAnalytics(@Query() query: any) {
    return this.attendanceService.getAnalytics(query);
  }
}
