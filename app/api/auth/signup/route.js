import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    console.log('Signup attempt started');
    await dbConnect();
    console.log('Database connected');
    
    const { name, email, password, role } = await request.json();
    console.log('Request data parsed:', { name, email, role });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    console.log('Creating new user...');
    const user = await User.create({ name, email, password, role: role || 'Member' });
    console.log('User created:', user._id);
    
    const token = signToken({ userId: user._id, role: user.role });
    console.log('Token generated');

    return NextResponse.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
}