import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [uploadResponse, setUploadResponse] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees. Please try again.');
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedDate || !file) {
      setError('Please select a date and file');
      return;
    }

    const formData = new FormData();
    formData.append('date', selectedDate);
    formData.append('excel-file', file);

    try {
      const response = await axios.post('http://localhost:5000/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadedFiles([...uploadedFiles, selectedDate]);
      setError('');
      setUploadResponse(response.data);
      alert('Attendance uploaded successfully');
      fetchEmployees(); // Refresh employee data after upload
    } catch (error) {
      console.error('Error uploading attendance:', error);
      setError('Failed to upload attendance. Please try again.');
      setUploadResponse(error.response?.data);
    }
  };

  return (
    <div className="attendance-tracker">
      <h2>Attendance Tracker</h2>
      {error && <div className="error">{error}</div>}
      <div className="upload-section">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <input
          type="file"
          onChange={handleFileChange}
          accept=".xlsx, .xls"
        />
        <button onClick={handleUpload}>Upload Attendance</button>
      </div>
      {uploadResponse && (
        <div className="upload-response">
          <h3>Upload Response</h3>
          <pre>{JSON.stringify(uploadResponse, null, 2)}</pre>
        </div>
      )}
      <div className="uploaded-files">
        <h3>Uploaded Attendance Records</h3>
        <ul>
          {uploadedFiles.map((date, index) => (
            <li key={index}>{date}</li>
          ))}
        </ul>
      </div>
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
              <tr key={employee.employeeId}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.attendance?.filter(a => a.status === 'Present').length || 0}</td>
                <td>{employee.attendance?.length || 0}</td>
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