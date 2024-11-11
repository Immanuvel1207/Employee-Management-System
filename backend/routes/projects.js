// routes/projects.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Employee = require('../models/Employee');

// Create a new project
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('employees', 'name employeeId');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an employee to a project
router.post('/:projectId/employees', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { employeeId } = req.body;
    
    const project = await Project.findById(projectId);
    const employee = await Employee.findOne({ employeeId: employeeId });
    
    if (!project || !employee) {
      return res.status(404).json({ message: 'Project or Employee not found' });
    }
    
    if (!project.employees.includes(employee._id)) {
      project.employees.push(employee._id);
      await project.save();
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;