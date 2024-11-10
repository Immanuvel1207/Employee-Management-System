const mongoose = require('mongoose');


const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  isUninformed: { type: Boolean, default: false },
  isTakenAfterRejection: { type: Boolean, default: false }
});

module.exports = mongoose.model('Leave', leaveSchema);