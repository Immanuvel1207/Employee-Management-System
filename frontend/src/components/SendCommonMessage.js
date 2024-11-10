import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminHome.css';
import './SendCommonMessage.css';
import { useNavigate } from 'react-router-dom';
function SendCommonMessage() {
  const [commonMessage, setCommonMessage] = useState('');

  const handleInputChange = (e) => {
    setCommonMessage(e.target.value);
  };

  const navigate = useNavigate();

  const handleSendCommonMessage = async () => {
    try {
      await axios.post('http://localhost:5000/employees/message', { message: commonMessage });
      toast.success('Message sent to all employees');
      setCommonMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="common-message">
      <h3>Send Common Message</h3>
      <textarea
        cols={50}
        rows={5}
        value={commonMessage}
        onChange={handleInputChange}
        placeholder="Type your message here"
      />
      <br/>
      <button onClick={handleSendCommonMessage}>Send Message</button>

      <br/>
    </div>
  );
}

export default SendCommonMessage;
