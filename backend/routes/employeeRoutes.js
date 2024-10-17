const express = require('express');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, 'secretKey');
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Get all employees (Admin)
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  const employees = await Employee.find();
  res.json(employees);
});

// Get single employee (Employee)
router.get('/:id', verifyToken, async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (req.user.role === 'Employee' && req.user.id !== employee._id) return res.status(403).json({ message: 'Forbidden' });
  res.json(employee);
});

// Add employee (Admin)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  const newEmployee = new Employee(req.body);
  await newEmployee.save();
  res.status(201).json({ message: 'Employee added successfully' });
});

// Update employee (Admin)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  await Employee.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: 'Employee updated successfully' });
});

// Delete employee (Admin)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: 'Employee deleted successfully' });
});

// Attendance marking
router.post('/attendance/:id', verifyToken, async (req, res) => {
  const { date, status } = req.body;
  const employee = await Employee.findById(req.params.id);
  employee.attendance.push({ date, status });
  await employee.save();
  res.json({ message: 'Attendance marked' });
});

// Download employee list as PDF
router.get('/download/employees', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });

  const doc = new PDFDocument();
  doc.pipe(res);
  const employees = await Employee.find();
  employees.forEach(emp => {
    doc.text(`Name: ${emp.name}, Email: ${emp.email}, Role: ${emp.role}`);
  });
  doc.end();
});

// Download attendance report as PDF
router.get('/download/attendance', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });

  const doc = new PDFDocument();
  doc.pipe(res);
  const employees = await Employee.find();
  employees.forEach(emp => {
    doc.text(`Employee: ${emp.name}`);
    emp.attendance.forEach(att => {
      doc.text(`Date: ${att.date}, Status: ${att.status}`);
    });
  });
  doc.end();
});

module.exports = router;
