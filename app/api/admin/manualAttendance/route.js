import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(req) {
  const { userId, date, status } = await req.json();

  if (!userId || !date || !status ) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  } else if(status === "absent") 
    return NextResponse.json(
      { message: 'Attendance marked successfully' },
      { status: 200 }
    );

  try {
    // Check if attendance already exists for this user and date
    const [existingAttendance] = await db.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (existingAttendance.length > 0) {
      // Update existing attendance
      await db.query(
        'UPDATE attendance SET status = ? WHERE user_id = ? AND date = ?',
        [status, userId, date]
      );
    } else {
      // Insert new attendance record
      console.log([userId, date, status])
      await db.query(
        'INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)',
        [userId, date, status]
      );
    }

    return NextResponse.json(
      { message: 'Attendance marked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' }, // Error here ? 
      { status: 500 }
    );
  }
} 