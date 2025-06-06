# Face Recognition Attendance System

A modern attendance management system that uses facial recognition technology to mark attendance. The system supports both face recognition and QR code-based attendance marking, along with comprehensive admin features.

## Features

### Face Recognition
- Real-time face detection and recognition
- Face registration for new users
- Secure face verification for attendance marking
- Confidence score tracking for each attendance
- Face data storage with privacy protection

### QR Code Attendance
- Dynamic QR code generation
- One-minute validity period
- Automatic expiration
- Real-time attendance tracking

### Admin Features
- User management (add/edit/delete users)
- Attendance approval/rejection
- Leave request management
- Working days tracking
- Monthly attendance reports
- Export attendance data to Excel

### User Features
- Face registration
- Attendance marking via face recognition
- Leave request submission
- Attendance history viewing
- Profile management

## Tech Stack

- **Frontend**: Next.js, React.js, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Face Recognition**: face-api.js
- **Authentication**: JWT, bcrypt
- **QR Code**: qrcode.js
- **Data Export**: xlsx

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    face_data LONGBLOB DEFAULT NULL,
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Face Recognition Logs
```sql
CREATE TABLE face_recognition_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    confidence_score FLOAT NOT NULL,
    status ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_face_attendance (user_id, date)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'approved', 'pending', 'rejected', 'latePending', 'late') 
    NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (user_id, date)
);
```

### Leave Requests
```sql
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_leave_request (user_id, start_date, end_date)
);
```

### QR Code Table
```sql
CREATE TABLE qrcode (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    date DATE NOT NULL,
    status ENUM('active', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Monthly Working Days
```sql
CREATE TABLE monthly_workingdays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(15) NOT NULL,
    working_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd attendance-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=attendance_portal
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
- Create a MySQL database named `attendance_portal`
- Run the SQL schema provided above

5. Start the development server:
```bash
npm run dev
```

6. Access the application at `http://localhost:3000`

## Face Recognition Setup

1. The system uses face-api.js for face recognition
2. Model files are stored in `/public/models`
3. Face data is stored securely in the database
4. Each attendance is verified with a confidence score

## Security Features

- Face data is stored securely in LONGBLOB format
- JWT-based authentication
- Password hashing with bcrypt
- QR code expiration after 1 minute
- Unique attendance constraints
- Leave request overlap prevention

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

<!-- Remaining Tasks -->

-Deployment
-check working by real users
-Take Help/discuss with teacher. 
-manual attendance lag rahi ha but status update karne ka kam baqi ha. for users-> Attendance Report 
 for admin -> dashboard? why these are not updating solve them but first deploy it correctly. then these can 
 tracked easily. 


