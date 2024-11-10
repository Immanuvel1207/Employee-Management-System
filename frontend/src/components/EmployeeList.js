// EmployeeList.js
import React from 'react';
import './EmployeeList.css';

function EmployeeList({ employees, onEdit, onDelete }) {
  return (
    <div className="employee-list" style={{ display: 'flex' }}>
      {employees.length > 0 ? (
        employees.map((employee) => (
          <div className="employee-card" key={employee._id} style={{ display: 'flex' }}>
            <h3>{employee.name}</h3>
            <p><strong>ID:</strong> {employee.employeeId}</p>
            <p><strong>Phone:</strong> {employee.phoneNumber}</p>
            <p><strong>Sex:</strong> {employee.sex}</p>
            <p><strong>Qualifications:</strong> {employee.qualifications}</p>
            <p><strong>Role:</strong> {employee.role}</p>
            <p><strong>Salary:</strong> {employee.salary}</p>
            <p><strong>Joining Date:</strong> {employee.joiningDate}</p>
            <p><strong>Ststus:</strong>{employee.resignationDate ? `Resigned${employee.resignationDate}` : 'Active'}</p>
            <button 
              style={{ padding: '8px', marginBottom: '5px', backgroundColor: 'lightblue', borderRadius: '10px' }}
              onClick={() => onEdit(employee)}
            >
              Edit
            </button>
            <button 
              style={{ padding: '8px', marginBottom: '5px', backgroundColor: 'lightblue', borderRadius: '10px' }}
              onClick={() => onDelete(employee._id)}
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No employees found</p>
      )}
      
    </div>
  );
}

export default EmployeeList;
