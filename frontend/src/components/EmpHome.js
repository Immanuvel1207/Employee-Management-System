import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

function EmpHome() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ reason: '', date: dayjs().format('YYYY-MM-DD') });
  const [leaves, setLeaves] = useState([]);
  const [experience, setExperience] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeDetails();
    fetchLeaveRequests();
  }, []);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/employees/search/${id}`);
      setEmployee(response.data);
      calculateExperience(response.data.joiningDate);
    } catch (error) {
      console.error('Error fetching employee details', error);
      setError('Failed to fetch employee details. Please try again later.');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/leaves/employee/${id}`);
      setLeaves(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leave requests', error);
      setError('Failed to fetch leave requests. Please try again later.');
      setLeaves([]);
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
        employeeName: employee.name,
        ...leaveForm
      });
      fetchLeaveRequests(); // Refresh leave requests
      setLeaveForm({ reason: '', date: dayjs().format('YYYY-MM-DD') });
    } catch (error) {
      console.error('Error applying for leave', error);
      setError('Failed to submit leave request. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm({ ...leaveForm, [name]: value });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'orange';
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return employee ? (
    <div className="emp-home">
      <h2>Welcome, {employee.name}</h2>
      <div className="employee-card">
        <p><strong>ID:</strong> {employee.employeeId}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Salary:</strong> ${employee.salary}</p>
        <p><strong>Phone Number:</strong> {employee.phoneNumber}</p>
        <p><strong>Experience:</strong> {experience}</p>
      </div>

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
        <button onClick={handleLeaveApplication} className="btn-submit">Submit Leave Request</button>
      </div>

      <div className="leave-history">
        <h3>Leave Requests</h3>
        {leaves.length > 0 ? (
          <ul>
            {leaves.map((leave, index) => (
              <li key={leave._id || index} style={{marginBottom: '10px'}}>
                <span><strong>Date:</strong> {leave.date}</span><br/>
                <span><strong>Reason:</strong> {leave.reason}</span><br/>
                <span><strong>Status:</strong> <span style={{color: getStatusColor(leave.status)}}>{leave.status}</span></span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default EmpHome;