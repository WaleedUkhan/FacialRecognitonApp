import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
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

    const { imageData, faceDescriptor } = await req.json();
    if (!imageData || !faceDescriptor) {
      return NextResponse.json({ success: false, message: 'No image data or face descriptor provided' }, { status: 400 });
    }

    // Store face data in database
    await db.query(
      'UPDATE users SET face_data = ? WHERE id = ?',
      [JSON.stringify(faceDescriptor), decoded.id]
    );

    return NextResponse.json({ success: true, message: 'Face data registered successfully' });
  } catch (error) {
    console.error('Face registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Error registering face data' },
      { status: 500 }
    );
  }
} 