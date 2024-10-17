const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String, // Admin or Employee
  attendance: [{ date: String, status: String }],
  password: String,
});

module.exports = mongoose.model('Employee', employeeSchema);
