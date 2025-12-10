import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    (() => {
      const enableSsl = (() => {
        if (process.env.DATABASE_SSL && process.env.DATABASE_SSL.toLowerCase() === 'true') return true;
        if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')) return true;
        // default: enable SSL in production when DATABASE_URL looks like a remote/postgres provider
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) return true;
        return false;
      })();

      // Helpful debug output (won't show credentials)
      try {
        const dbUrl = process.env.DATABASE_URL || '';
        let dbHost = '';
        if (dbUrl) {
          try {
            // parse host without exposing credentials
            dbHost = new URL(dbUrl).hostname || '';
          } catch (e) {
            dbHost = '';
          }
        }
        // Log computed values to help debugging during dev only
        // (In production you may want to remove or redirect these logs)
        // eslint-disable-next-line no-console
        console.log(`TypeORM SSL enabled: ${enableSsl} | DATABASE_URL present: ${!!dbUrl} | DB host: ${dbHost}`);
      } catch (e) {
        // ignore logging errors
      }

      return TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: true,
        ssl: enableSsl ? { rejectUnauthorized: false } : false,
      });
    })(),
    AuthModule,
    UsersModule,
    ClassesModule,
    SubjectsModule,
    AttendanceModule,
    LeaveModule,
    ReportsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
