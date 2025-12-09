import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Subject } from './subject.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  batch: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: true })
  teacher: User;

  @Column({ nullable: true })
  teacherId: string;

  @OneToMany(() => User, (user) => user.class)
  students: User[];

  @OneToMany(() => Subject, (subject) => subject.class)
  subjects: Subject[];

  @CreateDateColumn()
  createdAt: Date;
}
