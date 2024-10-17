import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../App.css'; // Ensure this CSS file is linked for styling


function AdminHome() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    salary: ''
  });
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
      setFilteredEmployees(response.data); // Initially set the filtered employees to all
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(searchValue) ||
      employee.employeeId.toLowerCase().includes(searchValue) ||
      employee.department.toLowerCase().includes(searchValue)
    );
    setFilteredEmployees(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async () => {
    try {
      const response = await axios.post('http://localhost:5000/employees', newEmployee);
      setEmployees((prev) => [...prev, response.data]);
      setFilteredEmployees((prev) => [...prev, response.data]);
      toast.success('Employee added successfully');
      setNewEmployee({ name: '', email: '', department: '', salary: '' }); // Reset form
    } catch (error) {
      toast.error('Failed to add employee: ' + error.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      setEmployees((prev) => prev.filter(employee => employee._id !== id));
      setFilteredEmployees((prev) => prev.filter(employee => employee._id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      toast.error('Failed to delete employee: ' + error.message);
    }
  };

  const handleUpdateEmployee = async (id) => {
    try {
      const updatedData = { ...newEmployee }; // Get data from the form
      const response = await axios.put(`http://localhost:5000/employees/${id}`, updatedData);
      setEmployees((prev) => prev.map(employee => (employee._id === id ? response.data : employee)));
      setFilteredEmployees((prev) => prev.map(employee => (employee._id === id ? response.data : employee)));
      toast.success('Employee updated successfully');
      setCurrentEmployeeId(null); // Reset the current employee ID
      setNewEmployee({ name: '', email: '', department: '', salary: '' }); // Reset form
    } catch (error) {
      toast.error('Failed to update employee: ' + error.message);
    }
  };

  const handleEditClick = (employee) => {
    setCurrentEmployeeId(employee._id);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      salary: employee.salary
    });
  };

  return (
    <div className="container">
      <h2>Employee Management System</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search by name, ID or department" 
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      

      {/* Add Employee Form */}
      <div className="employee-form">
        <h2>{currentEmployeeId ? 'Update Employee' : 'Add New Employee'}</h2>
        <input 
          type="text" 
          name="name" 
          placeholder="Name" 
          value={newEmployee.name} 
          required
          onChange={handleInputChange}
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={newEmployee.email} 
          required
          onChange={handleInputChange}
        />
        <input 
          type="text" 
          name="department" 
          placeholder="Department" 
          value={newEmployee.department} 
          required
          onChange={handleInputChange}
        />
        <input 
          type="number" 
          name="salary" 
          placeholder="Salary" 
          value={newEmployee.salary} 
          required
          onChange={handleInputChange}
        />
        <button onClick={currentEmployeeId ? () => handleUpdateEmployee(currentEmployeeId) : handleAddEmployee}>
          {currentEmployeeId ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
 
      {/* Employee Cards */}
      <div className="employee-list">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div className="employee-card" key={employee._id}>
              <h3>{employee.name}</h3>
              <p><strong>ID:</strong> {employee.employeeId}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Salary:</strong> ${employee.salary}</p>
              <button onClick={() => handleEditClick(employee)}>Update</button><br/>
              <button onClick={() => handleDeleteEmployee(employee._id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No employees found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminHome;
