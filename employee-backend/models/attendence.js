const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
    checkInTime: { type: String },
    checkOutTime: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);