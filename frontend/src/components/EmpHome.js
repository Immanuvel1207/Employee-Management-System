import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Create this file for custom styling
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

function EmpHome() {
  const { id } = useParams(); // Get employee ID from route params
  const [employee, setEmployee] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ reason: '', status: 'Pending', date: dayjs().format('YYYY-MM-DD') });
  const [applied, setApplied] = useState(false);
  const [experience, setExperience] = useState('');

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/employees/search/${id}`);
      setEmployee(response.data);
      calculateExperience(response.data.joiningDate);
    } catch (error) {
      console.error('Error fetching employee details', error);
    }
  };

  const calculateExperience = (joiningDate) => {
    const today = dayjs();
    const joining = dayjs(joiningDate);
    const years = today.diff(joining, 'year');
    setExperience(`${years} year(s)`);
  };

  const handleLeaveApplication = async () => {
    try {
      await axios.post(`http://localhost:5000/leaves`, {
        employeeId: id,
        reason: leaveForm.reason,
        date: leaveForm.date,
        status: leaveForm.status,
      });
      setApplied(true);
    } catch (error) {
      console.error('Error applying for leave', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm({ ...leaveForm, [name]: value });
  };

  return employee ? (
    <div className="emp-home" style={{marginLeft:'800px',marginTop:'200px'}}>
      <h2>Welcome, {employee.name}</h2>
      <br/> 
      <div className="employee-card">
        <p><strong>ID:</strong> {employee.employeeId}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Salary:</strong> ${employee.salary}</p>
        <p><strong>Salary:</strong> ${employee.salary}</p>
        <p><strong>phoneNumber:</strong> {employee.phoneNumber}</p>
      </div>
    <br/>
      {!applied ? (
        <div className="leave-form">
          <h3>Apply for Leave</h3>
          <input
            type="text"
            name="reason"
            placeholder="Reason for leave"
            value={leaveForm.reason}
            onChange={handleInputChange}
            className="form-input"
          />
          <input
            type="date"
            name="date"
            value={leaveForm.date}
            onChange={handleInputChange}
            className="form-input"
          />
          <button onClick={handleLeaveApplication} className="btn-submit">Submit Leave</button>
        </div>
      ) : (
        <p>Your leave request has been submitted with status: {leaveForm.status}</p>
      )}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default EmpHome;
