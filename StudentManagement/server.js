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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ Connected to MongoDB');
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
});

// Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Student = mongoose.model('Student', studentSchema);

// API Routes

// CREATE - Add new student
app.post('/api/students', async (req, res) => {
    try {
        const { name, rollNo, branch, email, phone, address } = req.body;

        if (!name || !rollNo || !branch || !email || !phone || !address) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student with this Roll No already exists' 
            });
        }

        const student = new Student({
            name,
            rollNo,
            branch,
            email,
            phone,
            address
        });

        await student.save();
        res.status(201).json({ 
            success: true, 
            message: 'Student added successfully',
            data: student 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// READ - Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            data: students,
            count: students.length 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// READ - Get student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }
        res.json({ 
            success: true, 
            data: student 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE - Update student by ID
app.put('/api/students/:id', async (req, res) => {
    try {
        const { name, rollNo, branch, email, phone, address } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        // Check if roll no is unique (excluding current student)
        if (rollNo !== student.rollNo) {
            const existingStudent = await Student.findOne({ rollNo });
            if (existingStudent) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Roll No already exists' 
                });
            }
        }

        student.name = name || student.name;
        student.rollNo = rollNo || student.rollNo;
        student.branch = branch || student.branch;
        student.email = email || student.email;
        student.phone = phone || student.phone;
        student.address = address || student.address;

        await student.save();
        res.json({ 
            success: true, 
            message: 'Student updated successfully',
            data: student 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE - Delete student by ID
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Student deleted successfully',
            data: student 
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});
