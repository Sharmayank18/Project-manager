import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    // Get user to check role
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.userId);
    
    let tasks;
    
    if (user.role === 'Admin') {
      // Admin sees all tasks in projects they own or are members of
      const userProjects = await Project.find({
        $or: [{ owner: decoded.userId }, { members: decoded.userId }]
      });
      const projectIds = userProjects.map(p => p._id);
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('project assignedTo createdBy', 'name email');
    } else {
      // Members only see tasks assigned to them
      tasks = await Task.find({ assignedTo: decoded.userId })
        .populate('project assignedTo createdBy', 'name email');
    }

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.userId);
    if (user.role !== 'Admin') {
      return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 });
    }

    const { title, description, project, assignedTo, priority, dueDate } = await request.json();

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: decoded.userId,
      priority,
      dueDate
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id, status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const task = await Task.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).populate('project assignedTo createdBy', 'name email');
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}