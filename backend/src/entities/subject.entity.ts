import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Class } from './class.entity';
import { Attendance } from './attendance.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @ManyToOne(() => Class, (cls) => cls.subjects)
  class: Class;

  @Column()
  classId: string;

  @OneToMany(() => Attendance, (attendance) => attendance.subject)
  attendances: Attendance[];

  @CreateDateColumn()
  createdAt: Date;
}
