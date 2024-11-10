import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import EmployeeList from './EmployeeList';
import AttendanceTracker from './AttendanceTracker';
import SalaryCalculator from './SalaryCalculator';
import SendCommonMessage from './SendCommonMessage';

export default function Component() {
  const [activeTab, setActiveTab] = useState('employees');
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', description: '' });
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
    experiencedRole: '',
    pf: '',
    da: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const employeesPerPage = 4;
  const [resignForm, setResignForm] = useState({ employeeId: '', resignationDate: '' });
  const [salaryRecords, setSalaryRecords] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
    fetchSalaryRecords();
    fetchHolidays();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://employee-management-system-backend-lie4.onrender.com/employees');
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchSalaryRecords = async () => {
    try {
      const response = await axios.get('https://employee-management-system-backend-lie4.onrender.com/salary/calculate');
      setSalaryRecords(response.data);
    } catch (error) {
      toast.error('Failed to fetch salary records');
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('https://employee-management-system-backend-lie4.onrender.com/holidays');
      setHolidays(response.data);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get('https://employee-management-system-backend-lie4.onrender.com/leaves');
      setLeaves(response.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    }
  };

  const handleResignEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://employee-management-system-backend-lie4.onrender.com/employees/resign/${resignForm.employeeId}`, {
        resignationDate: resignForm.resignationDate
      });
      toast.success('Employee resigned successfully');
      fetchEmployees();
      setResignForm({ employeeId: '', resignationDate: '' });
    } catch (error) {
      toast.error('Failed to resign employee');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async () => {
    try {
      const response = await axios.post('https://employee-management-system-backend-lie4.onrender.com/employees', newEmployee);
      setEmployees((prev) => [...prev, response.data]);
      setFilteredEmployees((prev) => [...prev, response.data]);
      toast.success('Employee added successfully');
      resetEmployeeForm();
    } catch (error) {
      toast.error('Failed to add employee: ' + error.message);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const response = await axios.put(`https://employee-management-system-backend-lie4.onrender.com/employees/${selectedEmployee._id}`, newEmployee);
      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === selectedEmployee._id ? response.data : employee
        )
      );
      toast.success('Employee updated successfully');
      resetEmployeeForm();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const resetEmployeeForm = () => {
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
      experiencedRole: '',
      pf: '',
      da: ''
    });
    setShowAddEmployeeForm(false);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee(employee);
    setShowAddEmployeeForm(true);
  };

  // const handleDeleteEmployee = async (id) => {
  //   try {
  //     await axios.delete(`https://employee-management-system-backend-lie4.onrender.com/employees/${id}`);
  //     setEmployees((prev) => prev.filter((employee) => employee._id !== id));
  //     setFilteredEmployees((prev) => prev.filter((employee) => employee._id !== id));
  //     toast.success('Employee deleted successfully');
  //   } catch (error) {
  //     toast.error('Failed to delete employee');
  //   }
  // };

  const handleDeleteEmployee = async (id) => {
    alert("You cannot delete an employee!! Instead resign him..");
  };

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(search) ||
      employee.employeeId.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search) ||
      employee.role.toLowerCase().includes(search)
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleLeaveApproval = async (leaveId, newStatus) => {
    try {
      await axios.put(`https://employee-management-system-backend-lie4.onrender.com/leaves/${leaveId}`, { status: newStatus });
      fetchLeaveRequests();
      toast.success(`Leave request ${newStatus.toLowerCase()} and email sent to employee`);
    } catch (error) {
      toast.error('Failed to update leave request');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://employee-management-system-backend-lie4.onrender.com/holidays', newHoliday);
      toast.success('Holiday added successfully');
      fetchHolidays();
      setNewHoliday({ date: '', description: '' });
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };


  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  return (
    <div className="admin-home">
      <h1 style={{textAlign:'center'}}>Employee Management System - Admin</h1>

      <div className="tabs" >
        <button className={activeTab === 'employees' ? 'active' : ''} onClick={() => setActiveTab('employees')}>Employees</button>
        <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>Attendance</button>
        <button className={activeTab === 'leaves' ? 'active' : ''} onClick={() => setActiveTab('leaves')}>Leaves</button>
        <button className={activeTab === 'salary' ? 'active' : ''} onClick={() => setActiveTab('salary')}>Salary</button>
        <button className={activeTab === 'holidays' ? 'active' : ''} onClick={() => setActiveTab('holidays')}>Holidays</button>
        <button className={activeTab === 'resign' ? 'active' : ''} onClick={() => setActiveTab('resign')}>Resign Employee</button>
        <button className={activeTab === 'message' ? 'active' : ''} onClick={() => setActiveTab('message')}>Send Message</button>
      </div>

      {activeTab === 'employees' && (
        <div className="tab-content">
          <div className="search-add">
            <input style={{width:'10%'}}
              type="text"
              placeholder="Search employees"
              value={searchTerm}
              onChange={handleSearch}
            />
            <br/>
            <button onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}>
              {showAddEmployeeForm ? 'Hide Form' : 'Add Employee'}
            </button>
          </div>

          {showAddEmployeeForm && (
            <div className="add-employee-form">
              <h3>{selectedEmployee ? 'Update Employee' : 'Add New Employee'}</h3>
              <div className="form-grid">
                <input name="name" placeholder="Name" value={newEmployee.name} onChange={handleInputChange} />
                <input name="email" type="email" placeholder="Email" value={newEmployee.email} onChange={handleInputChange} />
                <input name="department" placeholder="Department" value={newEmployee.department} onChange={handleInputChange} />
                <input name="salary" type="number" placeholder="Salary" value={newEmployee.salary} onChange={handleInputChange} />
                <input name="pf" type="number" placeholder="PF" value={newEmployee.pf} onChange={handleInputChange} />
                <input name="da" type="number" placeholder="DA" value={newEmployee.da} onChange={handleInputChange} />
                <input name="phoneNumber" placeholder="Phone Number" value={newEmployee.phoneNumber} onChange={handleInputChange} />
                <input name="sex" placeholder="Sex" value={newEmployee.sex} onChange={handleInputChange} />
                <input name="qualifications" placeholder="Qualifications" value={newEmployee.qualifications} onChange={handleInputChange} />
                <input name="role" placeholder="Role" value={newEmployee.role} onChange={handleInputChange} />
                <input name="dob" type="date" placeholder="Date of Birth" value={newEmployee.dob} onChange={handleInputChange} />
                <input name="joiningDate" type="date" placeholder="Joining Date" value={newEmployee.joiningDate} disabled />
                <select name="experience" value={newEmployee.experience} onChange={handleInputChange}>
                  <option value="No Experience">No Experience</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="3 Years">3 Years</option>
                  <option value="4 Years">4 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
                {newEmployee.experience !== 'No Experience' && (
                  <input
                    name="experiencedRole"
                    placeholder="Experienced Role"
                    value={newEmployee.experiencedRole}
                    onChange={handleInputChange}
                  />
                )}
              </div>
              <button onClick={selectedEmployee ? handleUpdateEmployee : handleAddEmployee}>
                {selectedEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          )}

          <EmployeeList
            employees={currentEmployees}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            onResign={handleResignEmployee}
          />

          <div className="pagination" style={{textAlign:'center',marginTop:'50px',padding:'10px'}}>
            <button style={{margin:'10px'}} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button style={{margin:'10px'}} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="tab-content">
          <h2>Attendance Management</h2>
          <AttendanceTracker />
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="tab-content">
          <h2>Leave Requests</h2>
          <table className="leave-requests">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.employeeName} ({leave.employeeId})</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.reason}</td>
                  <td>{leave.status}</td>
                  <td>
                    {leave.status === 'Pending' && (
                      <>
                        <button onClick={() => handleLeaveApproval(leave._id, 'Approved')}>Approve</button>
                        <button onClick={() => handleLeaveApproval(leave._id, 'Rejected')} className="reject">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="tab-content">
          <h2>Salary Management</h2>
          <table className="salary-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Present Days</th>
                <th>Total Days</th>
                <th>Working Days</th>
                <th>Base Salary (₹)</th>
                <th>Holiday Pay (₹)</th>
                <th>DA (₹)</th>
                <th>PF (₹)</th>
                <th>Deductions (₹)</th>
                <th>Net Salary (₹)</th>
                <th>Uninformed Leaves</th>
                
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.employeeId}>
                  <td>{record.employeeId}</td>
                  <td>{record.name}</td>
                  <td>{record.presentDays}</td>
                  <td>{record.totalDays}</td>
                  <td>{record.workingDays}</td>
                  <td>₹{record.baseSalary.toLocaleString()}</td>
                  <td>₹{record.holidayPay.toLocaleString()}</td>
                  <td>₹{record.da.toLocaleString()}</td>
                  <td>₹{record.pf.toLocaleString()}</td>
                  <td>₹{record.deductions.toLocaleString()}</td>
                  <td>₹{record.netSalary.toLocaleString()}</td>
                  <td>{record.uninformedLeaveDays}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="tab-content">
          <h2>Holiday Management</h2>
          <form onSubmit={handleAddHoliday} className="add-holiday-form">
          <input style={{width:'30%',margin:'10px'}}
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              required
            />
            <input style={{width:'30%',margin:'10px'}}
              type="text"
              value={newHoliday.description}
              onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
              placeholder="Holiday Description"
              required
            />
            <button type="submit">Add Holiday</button>
          </form>

          <table className="holidays-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday._id}>
                  <td>{holiday.date}</td>
                  <td>{holiday.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'resign' && (
        <div className="tab-content">
          <h2>Resign Employee</h2>
          <form onSubmit={handleResignEmployee} className="resign-form">
            <div>
              <label htmlFor="employeeId">Employee ID:</label>
              <input style={{width:'30%',margin:'10px'}}
                type="text"
                id="employeeId"
                value={resignForm.employeeId}
                onChange={(e) => setResignForm({ ...resignForm, employeeId: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="resignationDate">Resignation Date:</label>
              <input style={{width:'30%',margin:'10px'}}
                type="date"
                id="resignationDate"
                value={resignForm.resignationDate}
                onChange={(e) => setResignForm({ ...resignForm, resignationDate: e.target.value })}
                required
              />
            </div>
            <button type="submit">Submit Resignation</button>
          </form>
        </div>
      )}

      {activeTab === 'message' && (
        <div className="tab-content">
          <h2>Send Common Message</h2>
          <SendCommonMessage />
        </div>
      )}
    </div>
  );
}