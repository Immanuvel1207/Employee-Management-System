const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');
require('dotenv').config();



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
// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
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
mongoose.connect('mongodb://localhost:27017/employees_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Employee Schema
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
  experience: { type: String, required: true },
  experiencedRole: { type: String },
  attendance: [{ date: String, status: String }],
  pf: { type: Number, required: true },
  da: { type: Number, required: true }
});


// Employee Model
const Employee = mongoose.model('Employee', employeeSchema);

// Leave Schema
const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' } // Pending, Approved, Rejected
});

// Leave Model
const Leave = mongoose.model('Leave', leaveSchema);

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

// Get All Employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    console.log(`Fetched ${employees.length} employees`);
    res.json(employees);
  } catch (error) {
    handleError(res, error, 'Error fetching employees');
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
    const employee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const newLeave = new Leave({
      ...req.body,
      employeeName: employee.name
    });
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get All Pending Leave Requests
app.get('/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'Pending' });
    res.json(leaves);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Leave Requests by Employee ID
app.get('/leaves/employee/:employeeId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId });
    const acceptedLeaves = await AcceptedLeave.find({ employeeId: req.params.employeeId });
    res.json({ pending: leaves, accepted: acceptedLeaves });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update Leave Status
app.put('/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === 'Approved') {
      const leave = await Leave.findById(id);
      const acceptedLeave = new AcceptedLeave({
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        date: leave.date,
        reason: leave.reason
      });
      await acceptedLeave.save();
      await Leave.findByIdAndDelete(id);
      res.json({ message: 'Leave approved and moved to accepted leaves' });
    } else if (status === 'Rejected') {
      await Leave.findByIdAndDelete(id);
      res.json({ message: 'Leave rejected and removed' });
    } else {
      res.status(400).json({ message: 'Invalid status' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/leaves/employee/:employeeId', async (req, res) => {
  try {
    const pendingLeaves = await Leave.find({ employeeId: req.params.employeeId });
    const acceptedLeaves = await AcceptedLeave.find({ employeeId: req.params.employeeId });
    
    // Combine and format all leaves
    const allLeaves = [
      ...pendingLeaves.map(leave => ({...leave.toObject(), status: 'Pending'})),
      ...acceptedLeaves.map(leave => ({...leave.toObject(), status: 'Approved'}))
    ];

    res.json(allLeaves);
  } catch (error) {
    res.status(500).send(error);
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


// Upload Attendance
// Upload Attendance
app.post('/attendance/upload', upload.single('excel-file'), async (req, res) => {
  console.log('Attendance upload initiated');

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
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
    const employees = await Employee.find();
    console.log(`Total employees in database: ${employees.length}`);

    // Update attendance for each employee
    for (const employee of employees) {
      const isPresent = presentEmployeeIds.includes(employee.employeeId);
      const status = isPresent ? 'Present' : 'Absent';
      
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
    handleError(res, error, 'Error processing attendance data');
  }
});

 

// Calculate Salary
// Calculate Salary
app.get('/salary/calculate', async (req, res) => {
  try {
    const employees = await Employee.find();
    const salaryRecords = employees.map(employee => {
      const presentDays = employee.attendance.filter(a => a.status === 'Present').length;
      const totalDays = employee.attendance.length || 30; // Assuming 30 days if no attendance records
      const baseSalary = (employee.salary / totalDays) * presentDays;
      const da = employee.da || 0;
      const pf = employee.pf || 0;
      const netSalary = baseSalary + da - pf;
      return {
        employeeId: employee.employeeId,
        name: employee.name,
        presentDays,
        totalDays,
        baseSalary: Math.round(baseSalary),
        da,
        pf,
        netSalary: Math.round(netSalary)
      };
    });
    console.log(`Calculated salaries for ${salaryRecords.length} employees`);
    res.json(salaryRecords);
  } catch (error) {
    handleError(res, error, 'Error calculating salaries');
  }
});


  
// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
