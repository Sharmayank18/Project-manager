import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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

    // Get all users (excluding passwords)
    const users = await User.find({}, '-password').lean();

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}