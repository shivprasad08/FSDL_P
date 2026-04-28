# Student Record Management System - Setup Instructions

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas cloud)
- npm

## Installation

1. Navigate to the project directory:
```bash
cd studentmanagement
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Option 1: Local MongoDB
Make sure MongoDB is running on your machine on port 27017.

### Option 2: MongoDB Atlas (Cloud)
Create a `.env` file in the project root:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_management
PORT=5000
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on http://localhost:5000

## API Endpoints

### Create Student
- **POST** `/api/students`
- Body: `{ name, rollNo, branch, email, phone, address }`

### Get All Students
- **GET** `/api/students`

### Get Student by ID
- **GET** `/api/students/:id`

### Update Student
- **PUT** `/api/students/:id`
- Body: `{ name, rollNo, branch, email, phone, address }`

### Delete Student
- **DELETE** `/api/students/:id`

## Features

✓ Add new student records
✓ View all students in a table
✓ Search students by name, roll no, or email
✓ Edit existing student details
✓ Delete student records
✓ Form validation
✓ MongoDB persistence
✓ Responsive design

## Database Schema

```javascript
{
  name: String (required),
  rollNo: String (required, unique),
  branch: String (required),
  email: String (required),
  phone: String (required),
  address: String (required),
  createdAt: Date (default: now)
}
```
