import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  try {
    const [students] = await db.query(
      "SELECT id, name FROM users WHERE role = 'student' ORDER BY name"
    );
    
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 
