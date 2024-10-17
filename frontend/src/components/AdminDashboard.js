import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch employees from API
    // This is a placeholder, you'll need to implement the actual API call
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    // Placeholder for API call
    const response = await fetch('/api/employees');
    const data = await response.json();
    setEmployees(data);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = () => {
    // Implement add employee logic
  };

  const handleRemoveEmployee = (id) => {
    // Implement remove employee logic
  };

  const handleUpdateEmployee = (id) => {
    // Implement update employee logic
  };

  const handleDownloadPDF = () => {
    // Implement PDF download logic
  };

  const handleDownloadAttendance = () => {
    // Implement attendance report download logic
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      <div className="row mb-3">
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Search employees"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={handleAddEmployee}>Add Employee</button>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.position}</td>
              <td>
                <button className="btn btn-sm btn-info mr-2" onClick={() => handleUpdateEmployee(employee.id)}>Update</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveEmployee(employee.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <button className="btn btn-secondary mr-2" onClick={handleDownloadPDF}>Download Employee List</button>
        <button className="btn btn-secondary" onClick={handleDownloadAttendance}>Download Attendance Report</button>
      </div>
    </div>
  );
};

export default AdminDashboard;