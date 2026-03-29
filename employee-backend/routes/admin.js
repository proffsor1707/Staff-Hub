const express = require('express');
const jwt = require('jsonwebtoken');
const Employee = require('/models/Employee');
const Attendance = require('/models/Attendance');
const Leave = require('/models/Leave');
const User = require('/models/User');
const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Add Employee
router.post('/employees', verifyToken, async (req, res) => {
    try {
        const employee = new Employee({
            name: req.body.name,
            email: req.body.email,
            department: req.body.department,
            position: req.body.position,
            userId: req.body.userId
        });
        await employee.save();
        res.json({ success: true, employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Employees
router.get('/employees', verifyToken, async (req, res) => {
    try {
        const employees = await Employee.find({ isActive: true });
        res.json({ success: true, employees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Today's Attendance
router.get('/attendance/today', verifyToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.find({ date: today });
        const employees = await Employee.find();
        
        const result = employees.map(emp => {
            const att = attendance.find(a => a.employeeId && a.employeeId.toString() === emp._id.toString());
            return {
                ...emp.toObject(),
                attendance: att ? 'Present' : 'Absent',
                checkInTime: att ? att.checkInTime : null
            };
        });
        
        res.json({ success: true, attendance: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Pending Leaves
router.get('/leaves/pending', verifyToken, async (req, res) => {
    try {
        const leaves = await Leave.find({ status: 'pending' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Approve/Reject Leave
router.put('/leaves/:id/:action', verifyToken, async (req, res) => {
    try {
        const { id, action } = req.params;
        const leave = await Leave.findById(id);
        
        if (!leave) {
            return res.json({ success: false, message: 'Leave not found' });
        }
        
        leave.status = action === 'approve' ? 'approved' : 'rejected';
        leave.approvedBy = req.user.userId;
        await leave.save();
        
        res.json({ 
            success: true, 
            message: `Leave ${action}d successfully` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;