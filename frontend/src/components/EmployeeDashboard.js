import React, { useState, useEffect } from 'react';

const EmployeeDashboard = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);

  useEffect(() => {
    // Fetch employee details from API
    // This is a placeholder, you'll need to implement the actual API call
    fetchEmployeeDetails();
  }, []);

  const fetchEmployeeDetails = async () => {
    // Placeholder for API call
    const response = await fetch('/api/employee/details');
    const data = await response.json();
    setEmployeeDetails(data);
  };

  if (!employeeDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Employee Dashboard</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Employee Details</h5>
          <p><strong>Name:</strong> {employeeDetails.name}</p>
          <p><strong>Email:</strong> {employeeDetails.email}</p>
          <p><strong>Position:</strong> {employeeDetails.position}</p>
          <p><strong>Department:</strong> {employeeDetails.department}</p>
          <p><strong>Join Date:</strong> {employeeDetails.joinDate}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;