import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (user.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all projects with detailed information
    const projects = await Project.find({})
      .populate('owner members', 'name email role')
      .lean();

    // Get all tasks for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id })
          .populate('assignedTo createdBy', 'name email')
          .lean();
        
        return {
          ...project,
          tasks,
          taskStats: {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'Todo').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            done: tasks.filter(t => t.status === 'Done').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
          }
        };
      })
    );

    return NextResponse.json(projectsWithTasks);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}