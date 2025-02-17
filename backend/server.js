const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
require('dotenv').config();
const Leave = require('./models/Leave');
const Employee = require('./models/Employee');
const nodemailer = require('nodemailer');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize the Twilio client
const twilioClient = twilio(accountSid, authToken);

const multer = require('multer');
const XLSX = require('xlsx');


// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}


// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const app = express();



// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


// Holiday Schema
const holidaySchema = new mongoose.Schema({
  date: String,
  description: String
});

const Holiday = mongoose.model('Holiday', holidaySchema);


// Employee Schema
// const employeeSchema = new mongoose.Schema({
//   employeeId: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   department: { type: String, required: true },
//   salary: { type: Number, required: true },
//   phoneNumber: { type: String, required: true },
//   sex: { type: String, required: true },
//   qualifications: { type: String, required: true },
//   role: { type: String, required: true },
//   dob: { type: String, required: true },
//   joiningDate: { type: String, required: true },
//   resignationDate: { type: String },
//   experience: { type: String, required: true },
//   experiencedRole: { type: String },
//   attendance: [{ date: String, status: String }],
//   pf: { type: Number, required: true },
//   da: { type: Number, required: true },
//   monthlySalary: {
//     month: String,
//     presentDays: Number,
//     totalDays: Number,
//     netSalary: Number
//   }
// });

// Employee Model
// const Employee = mongoose.model('Employee', employeeSchema);


// Accepted Leave Schema
const acceptedLeaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true },
  reason: { type: String, required: true }
});

// Accepted Leave Model
const AcceptedLeave = mongoose.model('AcceptedLeave', acceptedLeaveSchema);
  

// Helper function to generate unique ID
async function generateEmployeeId(department) {
  const count = await Employee.countDocuments({ department });
  const serial = (count + 1).toString().padStart(4, '0');  // 4-digit serial number
  return `${department.substring(0, 3).toUpperCase()}_${serial}`;
}

const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ message, error: error.message });
};

// Add holiday
app.post('/holidays', async (req, res) => {
  try {
    const newHoliday = new Holiday(req.body);
    await newHoliday.save();
    res.status(201).json({ message: 'Holiday added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding holiday', error: error.message });
  }
});

// Get holidays
app.get('/holidays', async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holidays', error: error.message });
  }
});

// Add Employee
app.post('/employees', async (req, res) => {
  try {
    // Automatically generate a unique employee ID based on a count or other logic
    const employeeCount = await Employee.countDocuments();
    const employeeId = `EMP${employeeCount + 1}`; // Generate employee ID (e.g., EMP1, EMP2, etc.)

    const newEmployee = new Employee({
      employeeId: employeeId,
      ...req.body,  // Spread the request body to capture other fields
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const projectRoutes = require('./routes/projects');
app.use('/projects', projectRoutes);

// Get All Employees
app.get('/employees', async (req, res) => {
  try {
    const { includeResigned } = req.query;
    let query = {};
    if (includeResigned !== 'true') {
      query = { resignationDate: { $exists: false } };
    }
    const employees = await Employee.find(query);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});
// Update Employee
app.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete Employee
app.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Search Employee by ID
app.get('/employees/search/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/employees/search', async (req, res) => {
  try {
    const { query } = req.query;
    const employees = await Employee.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { role: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(employees);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update the route to get a single employee
app.get('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Add Leave Request
app.post('/leaves', async (req, res) => {
  try {
    const newLeave = new Leave(req.body);
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (error) {
    res.status(500).json({ message: 'Error adding leave request', error: error.message });
  }
});

// Get All Leave Requests (for Admin)
app.get('/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// Get Leave Requests by Employee ID
app.get('/leaves/employee/:employeeId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// Update Leave Status
// Update Leave Status route
app.put('/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedLeave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Send email notification
    const employee = await Employee.findOne({ employeeId: updatedLeave.employeeId });
    if (employee) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: `Leave Request ${status}`,
        text: `Your leave request from ${updatedLeave.startDate} to ${updatedLeave.endDate} has been ${status.toLowerCase()}.
        Reason: ${updatedLeave.reason}`
      };
      
      await transporter.sendMail(mailOptions);
    }
    
    res.json({ message: `Leave ${status.toLowerCase()}`, leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave status', error: error.message });
  }
});

app.get('/leaves/employee/:employeeId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Error fetching leaves', error: error.message });
  }
});
  
// Add the new route to send common message to all employees
app.post('/employees/message', async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch all employee phone numbers
    const employees = await Employee.find({}, { phoneNumber: 1, _id: 0 });
    const phoneNumbers = employees.map((emp) => emp.phoneNumber);

    // Send message to all phone numbers
    for (const phoneNumber of phoneNumbers) {
      await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber
      });
    }

    res.status(200).json({ success: true, message: 'Message sent to all employees' });
  } catch (error) {
    console.error('Error sending common message:', error);
    res.status(500).json({ success: false, message: 'Error sending common message' });
  }
});


// Update attendance upload route
app.post('/attendance/upload', upload.single('excel-file'), async (req, res) => {
  console.log('Attendance upload initiated');

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { date } = req.body;
  const today = dayjs();
  const uploadDate = dayjs(date);

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  if (uploadDate.isBefore(today.subtract(2, 'day')) || uploadDate.isAfter(today.add(2, 'day'))) {
    return res.status(400).json({ message: 'Attendance can only be uploaded for today, 2 days before, or 2 days after.' });
  }

  const existingAttendance = await Employee.findOne({ 'attendance.date': date });
  if (existingAttendance) {
    return res.status(400).json({ message: 'Attendance for this date has already been uploaded.' });
  }

  console.log(`Processing attendance for date: ${date}`);
  console.log(`File saved at: ${req.file.path}`);

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('Parsed Excel data:', data);

    // Extract employee IDs from the Excel data
    const presentEmployeeIds = data.map(row => row.employeeId.toString().trim());
    console.log('Present Employee IDs:', presentEmployeeIds);

    // Get all employees
    const employees = await Employee.find({ resignationDate: { $exists: false } });
    console.log(`Total employees in database: ${employees.length}`);

    // Check if the date is a holiday
    const holiday = await Holiday.findOne({ date });

    // Update attendance for each employee
    for (const employee of employees) {
      const isPresent = presentEmployeeIds.includes(employee.employeeId);
      let status = isPresent ? 'Present' : 'Absent';
      
      // Check for leave requests
      const leaveRequest = await Leave.findOne({ 
        employeeId: employee.employeeId,
        startDate: { $lte: date },
        endDate: { $gte: date }
      });
      
      if (leaveRequest) {
        if (leaveRequest.status === 'Approved') {
          status = 'On Leave';
        } else if (leaveRequest.status === 'Rejected' && !isPresent) {
          status = 'Absent (Leave Rejected)';
          await Leave.findByIdAndUpdate(leaveRequest._id, { isTakenAfterRejection: true });
        }
      } else if (!isPresent && !holiday) {
        // If absent without an approved leave and it's not a holiday, mark as uninformed leave
        const uninformedLeave = new Leave({
          employeeId: employee.employeeId,
          employeeName: employee.name,
          startDate: date,
          endDate: date,
          reason: 'Uninformed Leave',
          status: 'Rejected',
          isUninformed: true
        });
        await uninformedLeave.save();
      }
      
      if (holiday) {
        status = 'Holiday';
      }
      
      console.log(`Marking ${employee.employeeId} as ${status}`);
      
      // Find if attendance record for this date already exists
      const existingIndex = employee.attendance.findIndex(record => record.date === date);
      
      if (existingIndex !== -1) {
        employee.attendance[existingIndex] = { date, status };
      } else {
        employee.attendance.push({ date, status });
      }
      
      await employee.save();
    }
    
    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);
    console.log(`File deleted: ${req.file.path}`);
    
    console.log('Attendance marking completed successfully');
    res.status(200).json({ 
      message: 'Attendance data uploaded and processed successfully',
      presentEmployees: presentEmployeeIds
    });
  } catch (error) {
    console.error('Error processing attendance data:', error);
    res.status(500).json({ message: 'Error processing attendance data', error: error.message });
  }
});
 

// Update salary calculation route
// Update salary calculation to consider leave dates
app.get('/salary/calculate', async (req, res) => {
  const currentMonth = dayjs().format('YYYY-MM');
  const daysInMonth = dayjs().daysInMonth();
  
  try {
    const employees = await Employee.find({ resignationDate: { $exists: false } });
    const holidays = await Holiday.find({ date: { $regex: `^${currentMonth}` } });
    const holidayDates = holidays.map(h => h.date);

    const salaryRecords = await Promise.all(employees.map(async (employee) => {
      const monthAttendance = employee.attendance.filter(a => a.date.startsWith(currentMonth));
      const presentDays = monthAttendance.filter(a => a.status === 'Present').length;
      const holidaysInAttendance = monthAttendance.filter(a => holidayDates.includes(a.date)).length;
      
      // Calculate leave days considering start and end dates
      const leaves = await Leave.find({
        employeeId: employee.employeeId,
        status: 'Approved',
        $or: [
          { startDate: { $regex: `^${currentMonth}` } },
          { endDate: { $regex: `^${currentMonth}` } }
        ]
      });
      
      let leaveDays = 0;
      leaves.forEach(leave => {
        const start = dayjs(leave.startDate).startOf('day');
        const end = dayjs(leave.endDate).startOf('day');
        const daysOfLeave = end.diff(start, 'day') + 1;
        leaveDays += daysOfLeave;
      });
      
      const uninformedLeaveDays = monthAttendance.filter(a => a.status === 'Absent').length;
      const leavesTakenAfterRejection = monthAttendance.filter(a => a.status === 'Absent (Leave Rejected)').length;
      const totalWorkingDays = daysInMonth - holidayDates.length;
      const effectivePresentDays = presentDays + holidaysInAttendance + leaveDays;
      
      const baseSalary = (employee.salary / daysInMonth) * effectivePresentDays;
      const holidayPay = (employee.salary / daysInMonth) * holidaysInAttendance;
      const deductions = (employee.salary / daysInMonth) * (uninformedLeaveDays + leavesTakenAfterRejection);
      const netSalary = baseSalary + holidayPay + employee.da - employee.pf - deductions;

      const monthlySalary = {
        month: currentMonth,
        presentDays: effectivePresentDays,
        totalDays: daysInMonth,
        workingDays: totalWorkingDays,
        holidayPay,
        deductions,
        netSalary: Math.round(netSalary)
      };

      await Employee.findByIdAndUpdate(employee._id, { monthlySalary });

      return {
        employeeId: employee.employeeId,
        name: employee.name,
        presentDays: effectivePresentDays,
        totalDays: daysInMonth,
        workingDays: totalWorkingDays,
        baseSalary: Math.round(baseSalary),
        holidayPay: Math.round(holidayPay),
        da: employee.da,
        pf: employee.pf,
        deductions: Math.round(deductions),
        netSalary: Math.round(netSalary),
        uninformedLeaveDays,
        leavesTakenAfterRejection,
        approvedLeaveDays: leaveDays
      };
    }));

    res.json(salaryRecords);
  } catch (error) {
    console.error('Error calculating salaries:', error);
    res.status(500).json({ message: 'Error calculating salaries', error: error.message });
  }
});

// Resign Employee
app.put('/employees/resign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { resignationDate } = req.body;

    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId: id },
      { 
        resignationDate,
        isActive: false
      },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee resigned successfully', employee: updatedEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Error resigning employee', error: error.message });
  }
});


// Resign employee
app.post('/employees/:id/resign', async (req, res) => {
  const { id } = req.params;
  const { resignationDate } = req.body;

  try {
    const employee = await Employee.findOneAndUpdate(
      { employeeId: id },
      { resignationDate },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee resigned successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Error resigning employee', error: error.message });
  }
});

// Get employee attendance
app.get('/employees/:id/attendance', async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee.attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

  
// Start Server
const PORT = 5000;
module.exports = app;
