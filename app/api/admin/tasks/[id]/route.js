import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
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

    const { assignedTo } = await request.json();
    const taskId = params.id;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: assignedTo || null },
      { new: true }
    )
    .populate('project', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}