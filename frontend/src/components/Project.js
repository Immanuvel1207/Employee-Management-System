// components/Project.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Project.css';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    startDate: '',
    endDate: '',
    projectOwner: '',
    description: ''
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const API_URL = 'https://employee-management-system-aiyda5537.vercel.app/';

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://employee-management-system-aiyda5537.vercel.app//employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_URL}/projects`, newProject);
      setNewProject({
        title: '',
        startDate: '',
        endDate: '',
        projectOwner: '',
        description: ''
      });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddEmployee = async (projectId) => {
    try {
        await axios.post(`${API_URL}/projects/${projectId}/employees`, { employeeId: selectedEmployee });
      fetchProjects();
      setSelectedEmployee('');
    } catch (error) {
      console.error('Error adding employee to project:', error);
    }
  };

  return (
    <div className="project-container">
      <h2>Projects</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <input
          type="text"
          name="title"
          value={newProject.title}
          onChange={handleInputChange}
          placeholder="Project Title"
          required
        />
        <input
          type="date"
          name="startDate"
          value={newProject.startDate}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="endDate"
          value={newProject.endDate}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="projectOwner"
          value={newProject.projectOwner}
          onChange={handleInputChange}
          placeholder="Project Owner"
          required
        />
        <textarea
          name="description"
          value={newProject.description}
          onChange={handleInputChange}
          placeholder="Project Description"
          required
        ></textarea>
        <button type="submit">Create Project</button>
      </form>

      <div className="project-list">
        {projects.map((project) => (
          <div key={project._id} className="project-card">
            <h3>{project.title}</h3>
            <p><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}</p>
            <p><strong>Project Owner:</strong> {project.projectOwner}</p>
            <p><strong>Description:</strong> {project.description}</p>
            <div className="project-employees">
              <h4>Employees:</h4>
              <ul>
                {project.employees.map((employee) => (
                  <li key={employee._id}>{employee.name} ({employee.employeeId})</li>
                ))}
              </ul>
              <div className="add-employee">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.employeeId}>
                      {employee.name} ({employee.employeeId})
                    </option>
                  ))}
                </select>
                <button onClick={() => handleAddEmployee(project._id)}>Add Employee</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Project;