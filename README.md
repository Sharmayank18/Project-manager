# Project Manager

A full-stack web application for project and task management with role-based access control.

## Features

- **Authentication**: Signup/Login with JWT
- **Role-based Access**: Admin and Member roles
- **Project Management**: Create and manage projects
- **Task Management**: Create, assign, and track tasks
- **Dashboard**: Overview of projects, tasks, and progress
- **Status Tracking**: Todo, In Progress, Done
- **Priority Levels**: Low, Medium, High
- **Due Dates**: Track overdue tasks

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env.local`

3. **Configure environment variables**:
   ```bash
   cp .env.local .env.local
   # Update the values in .env.local
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## Usage

1. **Sign up** as Admin or Member
2. **Create projects** (any authenticated user)
3. **Add team members** to projects
4. **Create and assign tasks**
5. **Track progress** on the dashboard
6. **Update task status** as work progresses

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks` - Update task status

## Role Permissions

- **Admin**: Full access to all features
- **Member**: Can create projects, tasks, and manage assigned work

## Database Schema

### User
- name, email, password (hashed)
- role: Admin/Member
- timestamps

### Project
- name, description
- owner (User reference)
- members (User references)
- status: Active/Completed/On Hold
- timestamps

### Task
- title, description
- project (Project reference)
- assignedTo, createdBy (User references)
- status: Todo/In Progress/Done
- priority: Low/Medium/High
- dueDate
- timestamps