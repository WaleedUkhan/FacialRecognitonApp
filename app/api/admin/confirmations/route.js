import db from '@/lib/db'
import { NextResponse } from 'next/server';

export async function GET(req){

  const url = req.url;
  const urlParams = new URLSearchParams(url.split('?')[1]); 
  const type = urlParams.get('type');

  if(type === 'leaveRequest') {
    try {
      const pendings = await db.query(`SELECT user_id, start_date, end_date, reason, status FROM leave_requests WHERE status = 'pending' `);
      const users = await db.query(`SELECT id, name FROM users`);
      
      const data = pendings[0].map((row) => {  // pendings is 2D array 
        const user = users[0].find((user) => user.id === row.user_id); // users is also 2D array , row= current row. 
        return {
          ...row,
          name: user ? user.name : null
        };
      });
      
      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {

      console.log(error)
      return NextResponse.json({ message: error }, { status: 500 })
    }
  }

  // Add this new condition for face recognition logs
  if(type === 'faceRecognition') {
    try {
      const [pendingLogs] = await db.query(
        `SELECT f.user_id, f.date, f.confidence_score, f.status, u.name 
         FROM face_recognition_logs f
         JOIN users u ON f.user_id = u.id
         WHERE f.status = 'pending'`
      );
      
      const data = pendingLogs.map(log => ({
        ...log,
        date: log.date.toISOString().split('T')[0]
      }));

      return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
      console.error('Error fetching face recognition logs:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  try {
    const pendings = await db.query(`SELECT user_id, date, status FROM attendance WHERE status = 'latePending' OR status = 'pending'`);
    const users = await db.query(`SELECT id, name FROM users`);
    
    const data = pendings[0].map((row) => {
      const rowData = {...row, date: row.date.toISOString().split('T')[0]} //ISOString gives data + time but we removed time using split.
      const user = users[0].find((user) => user.id === row.user_id);
      return {
        ...rowData,
        name: user ? user.name : null
      };
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {

    console.log(error)
    return NextResponse.json({ message: error }, { status: 500 })
  }
}

export async function POST(req){
  const {type, date, start_date, end_date, user_id, status} = await req.json();

  if(type === 'leaveRequest') {
    try {
      const res = await db.query('UPDATE leave_requests SET status = ? WHERE user_id = ? AND start_date = ? AND end_date = ?', [status, user_id, start_date, end_date ])  
      
      if (res[0].affectedRows > 0) {
        return NextResponse.json({ message: 'Request confirmed successfully.' }, { status: 201 });
      }
      throw res[0].info;

    } catch (error) {
      
      console.log(error)
      return NextResponse.json({ message: error }, { status: 400 })
    }
  }

  // Add this new condition for face recognition logs
  if(type === 'faceRecognition') {
    try {
      // Begin transaction
      await db.query('START TRANSACTION');

      // Update status in face_recognition_logs
      const [updateResult] = await db.query(
        'UPDATE face_recognition_logs SET status = ? WHERE user_id = ? AND date = ?',
        [status, user_id, date]
      );

      // If approved, also insert or update in the attendance table
      if (status === 'approved') {
        // Check if there's already an attendance record
        const [existingAttendance] = await db.query(
          'SELECT id FROM attendance WHERE user_id = ? AND date = ?',
          [user_id, date]
        );

        if (existingAttendance.length > 0) {
          // Update existing attendance
          await db.query(
            'UPDATE attendance SET status = ? WHERE user_id = ? AND date = ?',
            ['approved', user_id, date]
          );
        } else {
          // Insert new attendance record
          await db.query(
            'INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)',
            [user_id, date, 'approved']
          );
        }
      }

      // Commit transaction
      await db.query('COMMIT');

      return NextResponse.json(
        { message: `Face recognition attendance ${status === 'approved' ? 'approved' : 'rejected'} successfully` },
        { status: 200 }
      );
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Error processing face recognition confirmation:', error);
      return NextResponse.json(
        { message: error.sqlMessage || error.message },
        { status: 500 }
      );
    }
  }

  console.log('Date got from client side for updating:',date)

  try {
    const res = await db.query('UPDATE attendance SET status = ? WHERE user_id = ? AND date = ?', [status, user_id, date ])  
    console.log('response after uploading to DB:',res)
    if (res[0].affectedRows > 0) {
      return NextResponse.json({ message: 'Attendance confirmed successfully.' }, { status: 201 });
    }
    throw res[0].info;

  } catch (error) {
    
    console.log('error while uploading to DB:',error)
    return NextResponse.json({ message: error.sqlMessage ? 'SQL query error: ' + error?.sqlMessage : error }, { status: 500 })
  }
}