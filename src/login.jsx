import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for routing

function Login() {
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();  // Initialize navigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/login',
        {
          patient_id: patientId,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',  // Ensure JSON content-type
          },
        }
      );
  
      setIsLoading(false);
      console.log(response.data);
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

  // Navigate to Sign In page
  const handleSignIn = () => {
    navigate('/register');  // Navigate to the Sign In page
  };

  // Navigate to Forgot Password page
  const handleForgotPassword = () => {
    navigate('/forgot-password');  // Navigate to Forgot Password page
  };

  return (
    <>
      <div className="login-container">
        <h1>Welcome!</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>
          {error && <p className="error-message">{error}</p>}
          <div className="additional-buttons">
            <button type="button" className="signin-btn" onClick={handleSignIn}>
              Sign Up
            </button>
            <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>
              Forgot Password
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>📞 <strong>Reception:</strong> +1 (555) 123-4567</p>
            <p>📧 <strong>Email:</strong> <a href="mailto:info@hospital.com">info@hospital.com</a></p>
          </div>
          <div className="footer-section">
            <h3>Operating Hours</h3>
            <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
            <p>Saturday: 9:00 AM - 5:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
          <div className="footer-section">
            <h3>Visit Us</h3>
            <p>🏥 123 Health Ave, Wellness City, 98765</p>
            <p>
              <a href="https://www.google.com/maps?q=123+Health+Ave,+Wellness+City,+98765" target="_blank">
                Get Directions
              </a>
            </p>
            <div className="social-media">
              <a href="https://facebook.com" target="_blank">Facebook</a> |
              <a href="https://twitter.com" target="_blank">Twitter</a> |
              <a href="https://instagram.com" target="_blank">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            In case of an emergency, call our hotline: 
            <strong style={{ color: "#ff6b6b" }}> +1 (555) 999-911</strong>
          </p>
          <p>
            &copy; 2024 Wellness Hospital. All Rights Reserved. 
            <a href="/privacy">Privacy Policy</a> | 
            <a href="/terms">Terms of Service</a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default Login;
