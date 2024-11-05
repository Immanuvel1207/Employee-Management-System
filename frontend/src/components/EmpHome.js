import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import './EmpHome.css';

const EmpHome = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ 
    reason: '', 
    date: dayjs().format('YYYY-MM-DD') 
  });
  const [leaves, setLeaves] = useState({
    pending: [],
    accepted: [],
    rejected: []
  });
  const [experience, setExperience] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchEmployeeDetails();
    fetchLeaveRequests();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/employees/search/${id}`);
      setEmployee(response.data);
      calculateExperience(response.data.joiningDate);
    } catch (error) {
      setError('Failed to fetch employee details. Please try again later.');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/leaves/employee/${id}`);
      setLeaves(response.data);
    } catch (error) {
      setError('Failed to fetch leave requests.');
      setLeaves({ pending: [], accepted: [], rejected: [] });
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
      await axios.post('http://localhost:5000/leaves', {
        employeeId: id,
        employeeName: employee?.name,
        ...leaveForm
      });
      fetchLeaveRequests();
      setLeaveForm({ reason: '', date: dayjs().format('YYYY-MM-DD') });
    } catch (error) {
      setError('Failed to submit leave request.');
    }
  };

  const getStatusColor = (status) => {
    return {
      'Approved': 'text-green-600',
      'Rejected': 'text-red-600',
      'Pending': 'text-yellow-600'
    }[status] || 'text-gray-600';
  };

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {employee?.name}</h2>
        
        {/* Employee Details Card */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-semibold">ID:</span> {employee?.employeeId}</p>
            <p><span className="font-semibold">Department:</span> {employee?.department}</p>
            <p><span className="font-semibold">Salary:</span> ${employee?.salary}</p>
            <p><span className="font-semibold">Phone:</span> {employee?.phoneNumber}</p>
            <p><span className="font-semibold">Experience:</span> {experience}</p>
          </div>
        </div>

        {/* Leave Application Form */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Apply for Leave</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Reason for leave"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              value={leaveForm.date}
              onChange={(e) => setLeaveForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleLeaveApplication}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Leave Request
            </button>
          </div>
        </div>

        {/* Leave Requests Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Leave Requests</h3>
          
          {/* Pending Leaves */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Pending Requests</h4>
            {leaves.pending?.length > 0 ? (
              <div className="space-y-3">
                {leaves.pending.map((leave, index) => (
                  <div style={{padding:'10px'}} key={leave._id || index} className="bg-gray-50 p-3 rounded">
                    <p><span className="font-medium">Date:</span> {leave.date}</p>
                    <p><span className="font-medium">Reason:</span> {leave.reason}</p>
                    <p className={getStatusColor('Pending')}>Status: Pending</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending requests</p>
            )}
          </div>

          {/* Accepted Leaves */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Approved Requests</h4>
            {leaves.accepted?.length > 0 ? (
              <div className="space-y-3">
                {leaves.accepted.map((leave, index) => (
                  <div style={{padding:'10px'}} key={leave._id || index} className="bg-gray-50 p-3 rounded">
                    <p><span className="font-medium">Date:</span> {leave.date}</p>
                    <p><span className="font-medium">Reason:</span> {leave.reason}</p>
                    <p className={getStatusColor('Approved')}>Status: Approved</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No approved requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpHome;