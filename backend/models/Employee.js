const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    salary: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    sex: { type: String, required: true },
    qualifications: { type: String, required: true },
    role: { type: String, required: true },
    dob: { type: String, required: true },
    joiningDate: { type: String, required: true },
    resignationDate: { type: String },
    experience: { type: String, required: true },
    experiencedRole: { type: String },
    attendance: [{ date: String, status: String }],
    pf: { type: Number, required: true },
    da: { type: Number, required: true },
    monthlySalary: {
      month: String,
      presentDays: Number,
      totalDays: Number,
      netSalary: Number
    }
  });
  
module.exports = mongoose.model('Employee', employeeSchema);