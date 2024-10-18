const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

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
  experiencedRole: { type: String }
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

// Routes

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
    res.json(employees);
  } catch (error) {
    res.status(500).send(error);
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
  
  app.post('/employees/message', (req, res) => {
    const { message } = req.body;
    // Logic to send message to all employees
    res.status(200).send({ success: true, message: 'Message sent to all employees' });
  });

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
