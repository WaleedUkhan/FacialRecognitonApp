import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has face data
    const [user] = await db.query(
      'SELECT face_data FROM users WHERE id = ?',
      [decoded.id]
    );

    return NextResponse.json({
      success: true,
      hasRegisteredFace: !!user?.face_data
    });
  } catch (error) {
    console.error('Face registration check error:', error);
    return NextResponse.json(
      { success: false, message: 'Error checking face registration status' },
      { status: 500 }
    );
  }
} 