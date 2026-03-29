const express = require('express');
const jwt = require('jsonwebtoken');
const Attendance = require('../employee-backend/models/Attendance');
const Leave = require('/models/Leave');
const Employee = require('/models/Employee');
const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.json({ success: false, message: 'No token' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.json({ success: false, message: 'Invalid token' });
    }
};

// Mark Attendance
router.post('/attendance', verifyToken, async (req, res) => {
    try {
        const { date, status } = req.body;
        const today = date || new Date().toISOString().split('T')[0];
        
        // Check if already marked
        const existing = await Attendance.findOne({ 
            userId: req.user.userId, 
            date: today 
        });
        
        if (existing) {
            return res.json({ 
                success: false, 
                message: 'Attendance already marked for today' 
            });
        }

        const attendance = new Attendance({
            userId: req.user.userId,
            date: today,
            status,
            checkInTime: new Date().toLocaleTimeString()
        });
        
        await attendance.save();
        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Apply Leave
router.post('/leave', verifyToken, async (req, res) => {
    try {
        const leave = new Leave({
            userId: req.user.userId,
            type: req.body.type,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
            reason: req.body.reason
        });
        
        await leave.save();
        res.json({ success: true, message: 'Leave request submitted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get My Attendance
router.get('/my-attendance', verifyToken, async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .limit(30);
        res.json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get My Leaves
router.get('/my-leaves', verifyToken, async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;