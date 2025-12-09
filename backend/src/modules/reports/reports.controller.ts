import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getDailyReport(@Query('date') date: string, @Query('classId') classId?: string) {
    return this.reportsService.getDailyReport(date, classId);
  }

  @Get('weekly')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getWeeklyReport(@Query('startDate') startDate: string, @Query('classId') classId?: string) {
    return this.reportsService.getWeeklyReport(startDate, classId);
  }

  @Get('monthly')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getMonthlyReport(@Query('month') month: string, @Query('year') year: string, @Query('classId') classId?: string) {
    return this.reportsService.getMonthlyReport(parseInt(month), parseInt(year), classId);
  }

  @Get('export/excel')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async exportExcel(@Query() query: any, @Res() res: Response) {
    const buffer = await this.reportsService.exportToExcel(query);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename=attendance_report.xlsx' });
    res.send(buffer);
  }

  @Get('export/pdf')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async exportPdf(@Query() query: any, @Res() res: Response) {
    const buffer = await this.reportsService.exportToPdf(query);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=attendance_report.pdf' });
    res.send(buffer);
  }
}
