"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const class_entity_1 = require("../entities/class.entity");
const subject_entity_1 = require("../entities/subject.entity");
const attendance_entity_1 = require("../entities/attendance.entity");
const leave_request_entity_1 = require("../entities/leave-request.entity");
const notification_entity_1 = require("../entities/notification.entity");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'geethu2626',
    database: 'postgres',
    entities: [user_entity_1.User, class_entity_1.Class, subject_entity_1.Subject, attendance_entity_1.Attendance, leave_request_entity_1.LeaveRequest, notification_entity_1.Notification],
    synchronize: true,
});
async function seed() {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(user_entity_1.User);
    const classRepo = AppDataSource.getRepository(class_entity_1.Class);
    const subjectRepo = AppDataSource.getRepository(subject_entity_1.Subject);
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
    const adminPassword = await bcrypt.hash('admin123', 10);
    await userRepo.save({ email: 'admin@school.com', password: adminPassword, name: 'Admin User', role: user_entity_1.UserRole.ADMIN });
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher1 = await userRepo.save({ email: 'teacher@school.com', password: teacherPassword, name: 'John Smith', role: user_entity_1.UserRole.TEACHER, phone: '9876543210' });
    const teacher2 = await userRepo.save({ email: 'teacher2@school.com', password: teacherPassword, name: 'Sarah Johnson', role: user_entity_1.UserRole.TEACHER, phone: '9876543211' });
    const teacher3 = await userRepo.save({ email: 'teacher3@school.com', password: teacherPassword, name: 'Mike Wilson', role: user_entity_1.UserRole.TEACHER, phone: '9876543212' });
    const btech1 = await classRepo.save({ name: 'BTech 1st Year', batch: '2024', teacherId: teacher1.id });
    const btech2 = await classRepo.save({ name: 'BTech 2nd Year', batch: '2024', teacherId: teacher2.id });
    const btech3 = await classRepo.save({ name: 'BTech 3rd Year', batch: '2024', teacherId: teacher3.id });
    const btech4 = await classRepo.save({ name: 'BTech 4th Year', batch: '2024', teacherId: teacher1.id });
    await subjectRepo.save([
        { name: 'Engineering Mathematics I', code: 'MATH101', classId: btech1.id },
        { name: 'Engineering Physics', code: 'PHY101', classId: btech1.id },
        { name: 'Engineering Chemistry', code: 'CHEM101', classId: btech1.id },
        { name: 'Programming in C', code: 'CS101', classId: btech1.id },
        { name: 'Engineering Drawing', code: 'ED101', classId: btech1.id },
        { name: 'Data Structures', code: 'CS201', classId: btech2.id },
        { name: 'Database Management', code: 'CS202', classId: btech2.id },
        { name: 'Object Oriented Programming', code: 'CS203', classId: btech2.id },
        { name: 'Digital Electronics', code: 'EC201', classId: btech2.id },
        { name: 'Discrete Mathematics', code: 'MATH201', classId: btech2.id },
        { name: 'Operating Systems', code: 'CS301', classId: btech3.id },
        { name: 'Computer Networks', code: 'CS302', classId: btech3.id },
        { name: 'Software Engineering', code: 'CS303', classId: btech3.id },
        { name: 'Web Technologies', code: 'CS304', classId: btech3.id },
        { name: 'Machine Learning', code: 'CS305', classId: btech3.id },
        { name: 'Cloud Computing', code: 'CS401', classId: btech4.id },
        { name: 'Artificial Intelligence', code: 'CS402', classId: btech4.id },
        { name: 'Big Data Analytics', code: 'CS403', classId: btech4.id },
        { name: 'Cyber Security', code: 'CS404', classId: btech4.id },
        { name: 'Project Work', code: 'CS405', classId: btech4.id },
    ]);
    const studentPassword = await bcrypt.hash('student123', 10);
    let studentNum = 1;
    for (const cls of [btech1, btech2, btech3, btech4]) {
        for (let i = 0; i < 10; i++) {
            await userRepo.save({
                email: `student${studentNum}@college.com`,
                password: studentPassword,
                name: `Student ${studentNum}`,
                role: user_entity_1.UserRole.STUDENT,
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
//# sourceMappingURL=seed.js.map