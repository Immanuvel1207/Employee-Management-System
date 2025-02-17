import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';



const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [file, setFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://employee-management-system-topaz-psi.vercel.app//employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedDate || !file) {
      toast.error('Please select a date and file');
      return;
    }

    const formData = new FormData();
    formData.append('date', selectedDate);
    formData.append('excel-file', file);

    setIsUploading(true);

    try {
      const response = await axios.post('https://employee-management-system-topaz-psi.vercel.app//attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      fetchEmployees(); // Refresh employee data after upload
    } catch (error) {
      console.error('Failed to upload attendance:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'Failed to upload attendance');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="attendance-tracker">
      <h2>Attendance Tracker</h2>
      <div className="upload-section">
      <input style={{width:'30%',margin:'10px'}}
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <br/>
        <input style={{width:'30%',margin:'10px'}}
          type="file"
          onChange={handleFileChange}
          accept=".xlsx, .xls"
        />
        <br/>
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Attendance'}
        </button>
      </div>
      <br/>
      <div className="employee-attendance">
        <h3>Employee Attendance</h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Present Days</th>
              <th>Total Days</th>
              <th>Latest Attendance</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.attendance ? employee.attendance.filter(a => a.status === 'Present').length : 0}</td>
                <td>{employee.attendance ? employee.attendance.length : 0}</td>
                <td>
                  {employee.attendance && employee.attendance.length > 0
                    ? `${employee.attendance[employee.attendance.length - 1].date}: ${employee.attendance[employee.attendance.length - 1].status}`
                    : 'No attendance record'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTracker;