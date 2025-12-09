import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  apply(@Body() data: any, @Request() req) {
    return this.leaveService.apply({ ...data, studentId: req.user.sub });
  }

  @Get('my')
  @Roles(UserRole.STUDENT)
  getMyLeaves(@Request() req) {
    return this.leaveService.getStudentLeaves(req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getAll(@Query('status') status?: string) {
    return this.leaveService.getAll(status);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  approve(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.leaveService.approve(id, req.user.sub, data.remarks);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  reject(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.leaveService.reject(id, req.user.sub, data.remarks);
  }
}
