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

async function resetAdmin() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  
  // Find admin user
  let admin = await userRepo.findOne({ where: { email: 'admin@school.com' } });
  
  const newPassword = await bcrypt.hash('admin123', 10);
  
  if (admin) {
    admin.password = newPassword;
    await userRepo.save(admin);
    console.log('Admin password reset to: admin123');
  } else {
    // Create admin if doesn't exist
    admin = userRepo.create({
      email: 'admin@school.com',
      password: newPassword,
      name: 'Admin User',
      role: UserRole.ADMIN
    });
    await userRepo.save(admin);
    console.log('Admin user created with password: admin123');
  }
  
  console.log('Admin email: admin@school.com');
  console.log('Admin password: admin123');
  
  await AppDataSource.destroy();
}

resetAdmin().catch(console.error);
