import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const projects = await Project.find({
      $or: [{ owner: decoded.userId }, { members: decoded.userId }]
    }).populate('owner members', 'name email');

    return NextResponse.json(projects);
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
      return NextResponse.json({ error: 'Only admins can create projects' }, { status: 403 });
    }

    const { name, description, members } = await request.json();

    const project = await Project.create({
      name,
      description,
      owner: decoded.userId,
      members: members || []
    });

    return NextResponse.json(project);
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
    
    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.userId);
    if (user.role !== 'Admin') {
      return NextResponse.json({ error: 'Only admins can edit projects' }, { status: 403 });
    }

    const { id, name, description, status, members } = await request.json();

    const project = await Project.findByIdAndUpdate(
      id,
      { name, description, status, members },
      { new: true }
    ).populate('owner members', 'name email');

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}