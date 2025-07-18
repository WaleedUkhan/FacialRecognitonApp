import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(req) {
    const { uuid, date, userId } = await req.json();

    if (typeof uuid == 'undefined') {
        return NextResponse.json({error: 'uuid is undefined'},{status:500})
    }

    try {
        const resp = await db.query('SELECT uuid, status FROM qrcode WHERE uuid = ?', [uuid]);
        
        if (!(resp[0].length > 0)) {
            console.log('Fake QR Code!!!');
            return NextResponse.json({ message: 'Something went wrong!!!' }, { status: 400 });
        }
        if (resp[0][0].status === 'expired') {
            console.log('QR Code Expired!!!');
            return NextResponse.json({ message: 'QR code expired!!!' }, { status: 404 });
        }

        // Check if the user has requested leave for this date
        const [leaveRequest] = await db.query(
            'SELECT * FROM leave_requests WHERE user_id = ? AND (start_date <= ? AND end_date >= ?)',
            [userId, date, date]
        );

        if (leaveRequest.length > 0) {
            console.log('User has requested leave for this date.');
            return NextResponse.json({ message: 'User has requested leave for this date.' }, { status: 400 });
        }

            await db.query(
                'INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)',
                [userId, date, 'approved']
            );
            
        return NextResponse.json({ message: 'Attendance marked successfully.' }, { status: 201 });
    } catch (error) {
        console.log('error:', error);
        if(error?.Error?.include("'root'@'localhost'"))
            return NextResponse.json({error: 'Database connection failed'}, {status:500})
        return NextResponse.json({ error }, { status: 500 });
    }
}
