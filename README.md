# Online Attendance Management System

A full-stack attendance management system with React + TypeScript frontend and NestJS backend.

## Features
- JWT-based authentication (Admin, Teacher, Student roles)
- Real-time attendance marking with timestamps
- Class/Batch/Subject management
- Daily, weekly, monthly attendance reports (PDF/Excel export)
- Student dashboard with attendance analytics
- Leave request management
- Low attendance alerts and notifications
- Interactive charts and visualizations

## Tech Stack
- Frontend: React + TypeScript + Vite + Chart.js
- Backend: NestJS + TypeORM
- Database: PostgreSQL

## Setup

### 1. Database Setup
```sql
CREATE DATABASE attendance_db;
```

### 2. Backend Setup
```bash
cd attendance-system/backend
npm install
npm run seed    # Seeds demo data
npm run start:dev
```
Backend runs on http://localhost:3001

### 3. Frontend Setup
```bash
cd attendance-system/frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

## Demo Credentials
- Admin: admin@school.com / admin123
- Teacher: teacher@school.com / teacher123
- Student: student1@school.com / student123

## API Endpoints
- POST /api/auth/login - Login
- POST /api/auth/register - Register
- GET /api/users - List users
- GET /api/classes - List classes
- POST /api/attendance/bulk - Mark attendance
- GET /api/attendance/my - Student attendance
- GET /api/reports/daily - Daily report
- GET /api/leave - Leave requests
