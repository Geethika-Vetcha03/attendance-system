import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Class } from '../entities/class.entity';
import { Subject } from '../entities/subject.entity';
import { Attendance } from '../entities/attendance.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Notification } from '../entities/notification.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'geethu2626',
  database: 'postgres',
  entities: [User, Class, Subject, Attendance, LeaveRequest, Notification],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(User);
  const classRepo = AppDataSource.getRepository(Class);
  const subjectRepo = AppDataSource.getRepository(Subject);

  // Check if data already exists
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log('=====================================');
    console.log('Database already has data!');
    console.log(`Found ${existingUsers} users.`);
    console.log('Skipping seed to preserve existing data.');
    console.log('To reset, manually clear the database first.');
    console.log('=====================================');
    await AppDataSource.destroy();
    return;
  }

  console.log('Database is empty. Seeding demo data...');

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await userRepo.save({ email: 'admin@school.com', password: adminPassword, name: 'Admin User', role: UserRole.ADMIN });

  // Create teachers
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher1 = await userRepo.save({ email: 'teacher@school.com', password: teacherPassword, name: 'John Smith', role: UserRole.TEACHER, phone: '9876543210' });
  const teacher2 = await userRepo.save({ email: 'teacher2@school.com', password: teacherPassword, name: 'Sarah Johnson', role: UserRole.TEACHER, phone: '9876543211' });
  const teacher3 = await userRepo.save({ email: 'teacher3@school.com', password: teacherPassword, name: 'Mike Wilson', role: UserRole.TEACHER, phone: '9876543212' });

  // Create BTech classes
  const btech1 = await classRepo.save({ name: 'BTech 1st Year', batch: '2024', teacherId: teacher1.id });
  const btech2 = await classRepo.save({ name: 'BTech 2nd Year', batch: '2024', teacherId: teacher2.id });
  const btech3 = await classRepo.save({ name: 'BTech 3rd Year', batch: '2024', teacherId: teacher3.id });
  const btech4 = await classRepo.save({ name: 'BTech 4th Year', batch: '2024', teacherId: teacher1.id });

  // Create subjects for BTech classes
  await subjectRepo.save([
    // BTech 1st Year subjects
    { name: 'Engineering Mathematics I', code: 'MATH101', classId: btech1.id },
    { name: 'Engineering Physics', code: 'PHY101', classId: btech1.id },
    { name: 'Engineering Chemistry', code: 'CHEM101', classId: btech1.id },
    { name: 'Programming in C', code: 'CS101', classId: btech1.id },
    { name: 'Engineering Drawing', code: 'ED101', classId: btech1.id },
    // BTech 2nd Year subjects
    { name: 'Data Structures', code: 'CS201', classId: btech2.id },
    { name: 'Database Management', code: 'CS202', classId: btech2.id },
    { name: 'Object Oriented Programming', code: 'CS203', classId: btech2.id },
    { name: 'Digital Electronics', code: 'EC201', classId: btech2.id },
    { name: 'Discrete Mathematics', code: 'MATH201', classId: btech2.id },
    // BTech 3rd Year subjects
    { name: 'Operating Systems', code: 'CS301', classId: btech3.id },
    { name: 'Computer Networks', code: 'CS302', classId: btech3.id },
    { name: 'Software Engineering', code: 'CS303', classId: btech3.id },
    { name: 'Web Technologies', code: 'CS304', classId: btech3.id },
    { name: 'Machine Learning', code: 'CS305', classId: btech3.id },
    // BTech 4th Year subjects
    { name: 'Cloud Computing', code: 'CS401', classId: btech4.id },
    { name: 'Artificial Intelligence', code: 'CS402', classId: btech4.id },
    { name: 'Big Data Analytics', code: 'CS403', classId: btech4.id },
    { name: 'Cyber Security', code: 'CS404', classId: btech4.id },
    { name: 'Project Work', code: 'CS405', classId: btech4.id },
  ]);

  // Create students for BTech classes
  const studentPassword = await bcrypt.hash('student123', 10);
  let studentNum = 1;
  for (const cls of [btech1, btech2, btech3, btech4]) {
    for (let i = 0; i < 10; i++) {
      await userRepo.save({ 
        email: `student${studentNum}@college.com`, 
        password: studentPassword, 
        name: `Student ${studentNum}`, 
        role: UserRole.STUDENT, 
        classId: cls.id 
      });
      studentNum++;
    }
  }

  console.log('=====================================');
  console.log('Seed completed successfully!');
  console.log('Demo accounts created:');
  console.log('  Admin: admin@school.com / admin123');
  console.log('  Teacher: teacher@school.com / teacher123');
  console.log('  Student: student1@college.com / student123');
  console.log('=====================================');
  await AppDataSource.destroy();
}

seed().catch(console.error);
