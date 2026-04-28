# Event Registration System - Setup Instructions

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas cloud)
- npm

## Installation

1. Navigate to the project directory:
```bash
cd eventregistration
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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_registration
PORT=5001
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

The server will start on http://localhost:5001

## API Endpoints

### Events Management

**Create Event**
- POST `/api/events`
- Body: `{ eventName, description, date, time, location, capacity }`

**Get All Events**
- GET `/api/events`

**Get Event Details**
- GET `/api/events/:id`

**Update Event**
- PUT `/api/events/:id`

**Delete Event**
- DELETE `/api/events/:id`

### Participant Management

**Register Participant**
- POST `/api/participants`
- Body: `{ eventId, name, email, phone, category }`

**Get Event Participants**
- GET `/api/participants/event/:eventId`

**Get Participant**
- GET `/api/participants/:id`

**Update Participant**
- PUT `/api/participants/:id`

**Remove Participant**
- DELETE `/api/participants/:id`

## Features

✓ Create and manage events
✓ View all events with details
✓ Register participants for events
✓ View registered participants
✓ Update participant information
✓ Remove participants
✓ Capacity management
✓ Prevent duplicate registrations
✓ Form validation
✓ MongoDB persistence
✓ Responsive design

## Database Schemas

### Event Schema
```javascript
{
  eventName: String (required),
  description: String (required),
  date: Date (required),
  time: String (required),
  location: String (required),
  capacity: Number (required),
  createdAt: Date (default: now)
}
```

### Participant Schema
```javascript
{
  eventId: ObjectId (reference to Event),
  name: String (required),
  email: String (required, lowercase),
  phone: String (required),
  category: String (required, enum: Student/Professional/Other),
  registeredAt: Date (default: now)
}
```
