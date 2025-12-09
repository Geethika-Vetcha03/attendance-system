import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Get('students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findStudents(@Query('classId') classId?: string) {
    return this.usersService.findStudents(classId);
  }

  @Get('teachers')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findTeachers() {
    return this.usersService.findTeachers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/assign-class')
  @Roles(UserRole.ADMIN)
  assignClass(@Param('id') id: string, @Body('classId') classId: string) {
    return this.usersService.assignClass(id, classId);
  }
}
