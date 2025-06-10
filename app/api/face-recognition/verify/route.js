import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import * as faceapi from 'face-api.js';

// Instead of processing the image on the server
// Only receive the face descriptor from the client
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

    const { faceDescriptor } = await req.json();
    if (!faceDescriptor) {
      return NextResponse.json({ success: false, message: 'No face descriptor provided' }, { status: 400 });
    }

    // Get user's face data from database
    const [user] = await db.query(
      'SELECT face_data FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user || !user.face_data) {
      return NextResponse.json(
        { success: false, message: 'No face data registered. Please register your face first.' },
        { status: 400 }
      );
    }

    // Compare with stored face data
    const storedFaceData = JSON.parse(user.face_data);
    // Convert the parsed array back to Float32Array
    const storedDescriptor = new Float32Array(storedFaceData);
    
    // Calculate Euclidean distance manually
    let distance = 0;
    for (let i = 0; i < faceDescriptor.length; i++) {
      distance += Math.pow(faceDescriptor[i] - storedDescriptor[i], 2);
    }
    distance = Math.sqrt(distance);

    // If distance is less than threshold, consider it a match
    const threshold = 0.6;
    if (distance > threshold) {
      return NextResponse.json(
        { success: false, message: 'Face verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Check if attendance already marked for today
    const today = new Date().toISOString().split('T')[0];
    const [existingAttendance] = await db.query(
      'SELECT id FROM face_recognition_logs WHERE user_id = ? AND date = ?',
      [decoded.id, today]
    );

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance already marked for today' },
        { status: 400 }
      );
    }

    // Insert attendance record
    await db.query(
      'INSERT INTO face_recognition_logs (user_id, date, confidence_score, status) VALUES (?, ?, ?, ?)',
      [decoded.id, today, 1 - distance, 'pending']
    );

    return NextResponse.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Face verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing face recognition' },
      { status: 500 }
    );
  }
}