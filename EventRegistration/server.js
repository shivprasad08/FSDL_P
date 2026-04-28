const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event_registration';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ Connected to MongoDB');
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
});

// Event Schema
const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Participant Schema
const participantSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Student', 'Professional', 'Other']
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', eventSchema);
const Participant = mongoose.model('Participant', participantSchema);

// Event Routes

// CREATE - Add new event
app.post('/api/events', async (req, res) => {
    try {
        const { eventName, description, date, time, location, capacity } = req.body;

        if (!eventName || !description || !date || !time || !location || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const event = new Event({
            eventName,
            description,
            date,
            time,
            location,
            capacity
        });

        await event.save();
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// READ - Get all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// READ - Get event by ID with participants count
app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const participantCount = await Participant.countDocuments({ eventId: req.params.id });
        const participants = await Participant.find({ eventId: req.params.id });

        res.json({
            success: true,
            data: {
                ...event.toObject(),
                participantCount,
                participants,
                availableSeats: event.capacity - participantCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE - Update event
app.put('/api/events/:id', async (req, res) => {
    try {
        const { eventName, description, date, time, location, capacity } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.eventName = eventName || event.eventName;
        event.description = description || event.description;
        event.date = date || event.date;
        event.time = time || event.time;
        event.location = location || event.location;
        event.capacity = capacity || event.capacity;

        await event.save();
        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE - Delete event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Delete all participants for this event
        await Participant.deleteMany({ eventId: req.params.id });

        res.json({
            success: true,
            message: 'Event deleted successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Participant Routes

// CREATE - Register participant
app.post('/api/participants', async (req, res) => {
    try {
        const { eventId, name, email, phone, category } = req.body;

        if (!eventId || !name || !email || !phone || !category) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const participantCount = await Participant.countDocuments({ eventId });
        if (participantCount >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Event capacity full'
            });
        }

        const existingParticipant = await Participant.findOne({
            eventId,
            email: email.toLowerCase()
        });

        if (existingParticipant) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        const participant = new Participant({
            eventId,
            name,
            email,
            phone,
            category
        });

        await participant.save();
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: participant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// READ - Get all participants for an event
app.get('/api/participants/event/:eventId', async (req, res) => {
    try {
        const participants = await Participant.find({ eventId: req.params.eventId }).sort({ registeredAt: -1 });
        res.json({
            success: true,
            data: participants,
            count: participants.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// READ - Get participant by ID
app.get('/api/participants/:id', async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }
        res.json({
            success: true,
            data: participant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE - Update participant
app.put('/api/participants/:id', async (req, res) => {
    try {
        const { name, email, phone, category } = req.body;

        const participant = await Participant.findById(req.params.id);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        participant.name = name || participant.name;
        participant.email = email || participant.email;
        participant.phone = phone || participant.phone;
        participant.category = category || participant.category;

        await participant.save();
        res.json({
            success: true,
            message: 'Participant updated successfully',
            data: participant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE - Remove participant
app.delete('/api/participants/:id', async (req, res) => {
    try {
        const participant = await Participant.findByIdAndDelete(req.params.id);
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }
        res.json({
            success: true,
            message: 'Participant removed successfully',
            data: participant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`✓ Event Registration Server running on http://localhost:${PORT}`);
});
