import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminHome.css';
import dayjs from 'dayjs';

function AdminHome() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    salary: '',
    phoneNumber: '',
    sex: '',
    qualifications: '',
    role: '',
    dob: '',
    joiningDate: dayjs().format('YYYY-MM-DD'),
    experience: 'No Experience',
    experiencedRole: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Track employee being updated
  const [attendance, setAttendance] = useState([]); // Store attendance records
  const [commonMessage, setCommonMessage] = useState(''); // Common message to all employees
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
    fetchAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/leaves');
      setLeaves(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    }
  };

  const handleLeaveApproval = async (leaveId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/leaves/${leaveId}`, { status: newStatus });
      setLeaves((prev) => prev.filter((leave) => leave._id !== leaveId));
      toast.success(`Leave request ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update leave request');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/attendance');
      setAttendance(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    }
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
      setNewEmployee({
        name: '',
        email: '',
        department: '',
        salary: '',
        phoneNumber: '',
        sex: '',
        qualifications: '',
        role: '',
        dob: '',
        joiningDate: dayjs().format('YYYY-MM-DD'),
        experience: 'No Experience',
        experiencedRole: ''
      });
    } catch (error) {
      toast.error('Failed to add employee: ' + error.message);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await axios.put(`http://localhost:5000/employees/${selectedEmployee._id}`, newEmployee);
      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === selectedEmployee._id ? { ...employee, ...newEmployee } : employee
        )
      );
      toast.success('Employee updated successfully');
      setSelectedEmployee(null);
      setNewEmployee({
        name: '',
        email: '',
        department: '',
        salary: '',
        phoneNumber: '',
        sex: '',
        qualifications: '',
        role: '',
        dob: '',
        joiningDate: dayjs().format('YYYY-MM-DD'),
        experience: 'No Experience',
        experiencedRole: ''
      });
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee(employee); // Pre-fill the form with employee's current data
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      setEmployees((prev) => prev.filter((employee) => employee._id !== id));
      setFilteredEmployees((prev) => prev.filter((employee) => employee._id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    if (search) {
      setFilteredEmployees(
        employees.filter((employee) =>
          employee.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredEmployees(employees);
    }
  };


  const handleSendCommonMessage = async () => {
    try {
      await axios.post('http://localhost:5000/employees/message', { message: commonMessage });
      toast.success('Message sent to all employees');
      setCommonMessage(''); // Reset the message input
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="admin-container">
      <h2>Employee Management System - Admin</h2>

      {/* Add / Update Employee Form */}
      <div className="employee-form">
        <h2>{selectedEmployee ? 'Update Employee' : 'Add New Employee'}</h2>
        <input type="text" name="name" placeholder="Name" value={newEmployee.name} onChange={handleInputChange} />
        <input type="email" name="email" placeholder="Email" value={newEmployee.email} onChange={handleInputChange} />
        <input type="text" name="department" placeholder="Department" value={newEmployee.department} onChange={handleInputChange} />
        <input type="number" name="salary" placeholder="Salary" value={newEmployee.salary} onChange={handleInputChange} />
        <input type="text" name="phoneNumber" placeholder="Phone Number" value={newEmployee.phoneNumber} onChange={handleInputChange} />
        <input type="text" name="sex" placeholder="Sex" value={newEmployee.sex} onChange={handleInputChange} />
        <input type="text" name="qualifications" placeholder="Qualifications" value={newEmployee.qualifications} onChange={handleInputChange} />
        <input type="text" name="role" placeholder="Role" value={newEmployee.role} onChange={handleInputChange} />
        <input type="date" name="dob" placeholder="Date of Birth" value={newEmployee.dob} onChange={handleInputChange} />
        <input type="date" name="joiningDate" placeholder="Joining Date" value={newEmployee.joiningDate} disabled />
        <select name="experience" value={newEmployee.experience} onChange={handleInputChange}>
          <option value="No Experience">No Experience</option>
          <option value="1 Year">1 Year</option>
          <option value="2 Years">2 Years</option>
          <option value="3 Years">3 Years</option>
          <option value="4 Years">4 Years</option>
          <option value="5 Years">5 Years</option>
          <option value="6 Years">6 Years</option>
          <option value="7 Years">7 Years</option>
          <option value="8 Years">8 Years</option>
          <option value="9 Years">9 Years</option>
          <option value="More than 10 Years">More than 10 Years</option>
          {/* More options */}
        </select>
        {newEmployee.experience !== 'No Experience' && (
          <input
            type="text"
            name="experiencedRole"
            placeholder="Experienced Role"
            value={newEmployee.experiencedRole}
            onChange={handleInputChange}
          />
        )}
        {selectedEmployee ? (
          <button onClick={handleUpdateEmployee}>Update Employee</button>
        ) : (
          <button onClick={handleAddEmployee}>Add Employee</button>
        )}
      </div>
 
<br/>
        {/* Search Functionality */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search employees by name"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>


        <h3 style={{marginLeft:'780px'}}>Employee List</h3>
      {/* Employee List */}
      <div className="employee-list" style={{display:'flex'}}>
        
        <br/>
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div className="employee-card" key={employee._id} style={{display:'flex'}}>
              <h3>{employee.name}</h3>
              <p><strong>ID:</strong> {employee.employeeId}</p>
              <p><strong>Phone:</strong> {employee.phoneNumber}</p>
              <p><strong>Sex:</strong> {employee.sex}</p>
              <p><strong>Qualifications:</strong> {employee.qualifications}</p>
              <p><strong>Role:</strong> {employee.role}</p>
              <p><strong>Salary:</strong> {employee.salary}</p>
              <p><strong>Joining Date:</strong> {employee.joiningDate}</p>
              <button style={{padding:'8px',marginBottom:'5px', backgroundColor:'lightblue',borderRadius:'10px'}} onClick={() => handleEditEmployee(employee)}>Edit</button>
              <button style={{padding:'8px',marginBottom:'5px', backgroundColor:'lightblue',borderRadius:'10px'}} onClick={() => handleDeleteEmployee(employee._id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No employees found</p>
        )}
      </div>

      {/* Attendance Section */}
      <div className="attendance-section">
        <h3>Track Attendance</h3>
        {attendance.length > 0 ? (
          attendance.map((record) => (
            <div key={record._id} className="attendance-record">
              <p><strong>Date:</strong> {record.date}</p>
              <p><strong>Employee ID:</strong> {record.employeeId}</p>
              <p><strong>Status:</strong> {record.status}</p>
            </div>
          ))
        ) : (
          <p>No attendance records available</p>
        )}
      </div>

      {/* Leave Requests Section */}
      <div className="leave-section">
        <h3>Pending Leave Requests</h3>
        {leaves.length > 0 ? (
          leaves.map((leave) => (
            <div key={leave._id} className="leave-request">
              <p><strong>Employee:</strong> {leave.employeeName} ({leave.employeeId})</p>
              <p><strong>Date:</strong> {leave.date}</p>
              <p><strong>Reason:</strong> {leave.reason}</p>
              <button onClick={() => handleLeaveApproval(leave._id, 'Approved')}>Approve</button>
              <button onClick={() => handleLeaveApproval(leave._id, 'Rejected')}>Reject</button>
            </div>
          ))
        ) : (
          <p>No pending leave requests</p>
        )}
      </div>

      {/* Send Common Message */}
      <div className="common-message">
        <h3>Send Common Message</h3>
        <textarea cols={50} rows={5}
          placeholder="Enter your message here"
          value={commonMessage}
          onChange={(e) => setCommonMessage(e.target.value)}
        />
        <br/>
        <button onClick={handleSendCommonMessage} style={{backgroundColor:'orange',padding:'5px',borderRadius:'20px'}}>Send Message</button>
      </div>
    </div>
  );
}

export default AdminHome;
