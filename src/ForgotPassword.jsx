import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function ForgotPassword() {
  const [patientId, setPatientId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();  // Use useNavigate instead of useHistory

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://aarnav-sd.github.io/appointments/api/reset-password', {
        patient_id: patientId,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setIsLoading(false);
        // Optionally redirect to login page after successful reset
        setTimeout(() => {
          navigate('/login');  // Use navigate instead of history.push
        }, 2000);
      } else {
        setError(response.data.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <input
          type="text"
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
}

export default ForgotPassword;
