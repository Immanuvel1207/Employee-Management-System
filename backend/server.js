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
  name: String,
  email: { type: String, unique: true },  // Unique email
  department: String,
  salary: Number,
  employeeId: String,  // Unique ID
});

// Employee Model
const Employee = mongoose.model('Employee', employeeSchema);

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
    const { name, email, department, salary } = req.body;
    
    // Check if the email is already used
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const employeeId = await generateEmployeeId(department);
    const newEmployee = new Employee({ name, email, department, salary, employeeId });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).send(error);
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

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
