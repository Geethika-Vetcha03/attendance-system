import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Attendance } from './attendance.entity';
import { LeaveRequest } from './leave-request.entity';
import { Notification } from './notification.entity';
import { Class } from './class.entity';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Class, (cls) => cls.students, { nullable: true })
  class: Class;

  @Column({ nullable: true })
  classId: string;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => LeaveRequest, (leave) => leave.student)
  leaveRequests: LeaveRequest[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;
}
