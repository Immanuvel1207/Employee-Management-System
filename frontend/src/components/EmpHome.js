import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import './EmpHome.css';

export default function Component() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ 
    reason: '', 
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });
  const [leaves, setLeaves] = useState([]);
  const [experience, setExperience] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeeResponse = await axios.get(`https://employee-management-system-topaz-psi.vercel.app//employees/search/${id}`);
        setEmployee(employeeResponse.data);
        if (employeeResponse.data && employeeResponse.data.joiningDate) {
          calculateExperience(employeeResponse.data.joiningDate);
        }
        if (!employeeResponse.data.resignationDate) {
          const leavesResponse = await axios.get(`https://employee-management-system-topaz-psi.vercel.app//leaves/employee/${id}`);
          setLeaves(leavesResponse.data);
        }
      } catch (error) {
        setError('Failed to fetch employee data. Please try again later.');
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const calculateExperience = (joiningDate) => {
    const today = dayjs();
    const joining = dayjs(joiningDate);
    const years = today.diff(joining, 'year');
    setExperience(`${years} year(s)`);
  };

  const handleLeaveApplication = async () => {
    try {
      if (!employee || employee.resignationDate) {
        throw new Error('Cannot apply for leave');
      }
      await axios.post('https://employee-management-system-topaz-psi.vercel.app//leaves', {
        employeeId: id,
        employeeName: employee.name,
        ...leaveForm
      });
      const response = await axios.get(`https://employee-management-system-topaz-psi.vercel.app//leaves/employee/${id}`);
      setLeaves(response.data);
      setLeaveForm({ reason: '', startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().format('YYYY-MM-DD') });
    } catch (error) {
      setError('Failed to submit leave request.');
      console.error('Error submitting leave request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-green-600';
      case 'Rejected': return 'text-red-600';
      case 'Pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error" role="alert">{error}</div>;
  }

  if (!employee) {
    return <div className="not-found" role="alert">Employee not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {employee.name}</h2>
        
        {/* Employee Details Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Employee Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-semibold">ID:</span> {employee.employeeId}</p>
            <p><span className="font-semibold">Name:</span> {employee.name}</p>
            <p><span className="font-semibold">Email:</span> {employee.email}</p>
            <p><span className="font-semibold">Department:</span> {employee.department}</p>
            <p><span className="font-semibold">Role:</span> {employee.role}</p>
            <p><span className="font-semibold">Phone:</span> {employee.phoneNumber}</p>
            <p><span className="font-semibold">Sex:</span> {employee.sex}</p>
            <p><span className="font-semibold">Date of Birth:</span> {employee.dob}</p>
            <p><span className="font-semibold">Joining Date:</span> {employee.joiningDate}</p>
            <p><span className="font-semibold">Experience:</span> {experience}</p>
            {employee.resignationDate && (
              <p className="col-span-2 text-red-600">Resigned on: {employee.resignationDate}</p>
            )}
          </div>
        </div>

        {!employee.resignationDate && (
          <>
            {/* Leave Application Section */}
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
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-1/2 p-2 border rounded"
                />
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-1/2 p-2 border rounded"
                />
              </div>
              <button
                onClick={handleLeaveApplication}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Leave Request
              </button>
            </div>
          </div>

            {/* Attendance Section */}
            <div className="attendance-section mb-8">
              <h3 className="text-xl font-semibold mb-4">Attendance</h3>
              {employee.attendance && employee.attendance.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.attendance.map((record, index) => (
                      <tr key={index}>
                        <td className="border p-2">{record.date}</td>
                        <td className="border p-2">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No attendance records available.</p>
              )}
            </div>

            {/* Salary Section */}
            {employee.monthlySalary && (
              <div className="salary-section mb-8">
                <h3 className="text-xl font-semibold mb-4">Current Month Salary Details</h3>
                <p><span className="font-semibold">Month:</span> {employee.monthlySalary.month}</p>
                <p><span className="font-semibold">Present Days:</span> {employee.monthlySalary.presentDays}</p>
                {/* <p><span className="font-semibold">Total Working Days:</span> {employee.monthlySalary.workingDays}</p> */}
                <p><span className="font-semibold">Base Salary:</span> ₹{employee.salary?.toLocaleString() ?? 'N/A'}</p>
                {/* <p><span className="font-semibold">Holiday Pay:</span> ₹{employee.monthlySalary.holidayPay?.toLocaleString() ?? 'N/A'}</p> */}
                <p><span className="font-semibold">DA:</span> ₹{employee.da?.toLocaleString() ?? 'N/A'}</p>
                <p><span className="font-semibold">PF:</span> ₹{employee.pf?.toLocaleString() ?? 'N/A'}</p>
                {/* <p><span className="font-semibold">Deductions:</span> ₹{employee.monthlySalary.deductions?.toLocaleString() ?? 'N/A'}</p> */}
                <p><span className="font-semibold">Net Salary:</span> ₹{employee.monthlySalary.netSalary?.toLocaleString() ?? 'N/A'}</p>
              </div>
            )}

            {/* Leave Requests Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Leave Requests</h3>
              
              {leaves.length > 0 ? (
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <div key={leave._id} className="bg-gray-50 p-3 rounded">
                      <p><span className="font-medium">Date:</span> {leave.date}</p>
                      <p><span className="font-medium">Reason:</span> {leave.reason}</p>
                      <p className={getStatusColor(leave.status)}>Status: {leave.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No leave requests found</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}