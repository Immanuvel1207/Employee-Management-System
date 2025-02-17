import React, { useState } from 'react';
import axios from 'axios';
import './SalaryCalculator.css';
const SalaryCalculator = () => {
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [error, setError] = useState('');

  const calculateSalary = async () => {
    try {
      const response = await axios.get('https://employee-management-system-aiyda5537.vercel.app//salary/calculate');
      setSalaryRecords(response.data);
      setError('');
      alert('Salaries calculated successfully');
    } catch (error) {
      console.error('Error calculating salaries:', error);
      setError('Failed to calculate salaries. Please try again.');
    }
  };

  return (
    <div className="salary-calculator">
      <h2>Salary Calculator</h2>
      {error && <div className="error">{error}</div>}
      <button onClick={calculateSalary}>Calculate Salaries</button>
      {salaryRecords.length > 0 && (
        <div className="salary-records">
          <h3>Salary Records</h3>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Present Days</th>
                <th>Total Days</th>
                <th>Base Salary (₹)</th>
                <th>DA (₹)</th>
                <th>PF (₹)</th>
                <th>Net Salary (₹)</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.employeeId}>
                  <td>{record.employeeId}</td>
                  <td>{record.name}</td>
                  <td>{record.presentDays}</td>
                  <td>{record.totalDays}</td>
                  <td>₹{record.baseSalary.toLocaleString()}</td>
                  <td>₹{record.da.toLocaleString()}</td>
                  <td>₹{record.pf.toLocaleString()}</td>
                  <td>₹{record.netSalary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;