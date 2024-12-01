import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('medicalHistory');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false); // To handle loading state for booking

  const navigate = useNavigate();

  // Placeholder data for departments and doctors
  const placeholderDepartments = [
    { name: 'Cardiology', doctors: ['Dr. Smith', 'Dr. Lee'] },
    { name: 'Dermatology', doctors: ['Dr. Johnson', 'Dr. Kim'] },
    { name: 'Oncology', doctors: ['Dr. Green', 'Dr. White'] },
    { name: 'Neurology', doctors: ['Dr. Taylor', 'Dr. Brown'] },
    { name: 'Orthopedics', doctors: ['Dr. Miller', 'Dr. Davis'] },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medicalHistoryResponse = await axios.get('/api/medical-history');
        setMedicalHistory(Array.isArray(medicalHistoryResponse.data) ? medicalHistoryResponse.data : []);
        
        // Setting the placeholder departments data
        setDepartments(placeholderDepartments);

        // Placeholder data for upcoming appointments while database is empty
        setUpcomingAppointments([
          { date: '2024-11-20', time: '10:00 AM', doctorName: 'Dr. Smith', department: 'Cardiology' },
          { date: '2024-11-21', time: '2:00 PM', doctorName: 'Dr. Johnson', department: 'Dermatology' }
        ]);

        setLoading(false);
      } catch (error) {
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowPrescription = (prescription) => {
    setPrescriptionData(prescription);
    setShowPrescription(true);
  };

  const handleCloseModal = () => {
    setShowPrescription(false);
    setPrescriptionData('');
  };

  const handleBookAppointment = async () => {
    setBookingLoading(true); // Start loading when booking an appointment
  
    const appointmentDetails = {
      patient_id: 'example_patient_id', 
      doctor_name: selectedDoctor,
      department: selectedDepartment,
      date: appointmentDate,
      time: appointmentTime,
    };
  
    try {
      // Send POST request to the backend API
      const response = await axios.post('/api/book-appointment', appointmentDetails);
  
      if (response.data.success) {
        alert('Appointment booked successfully');
        
        // Clear the form fields
        setSelectedDepartment('');
        setSelectedDoctor('');
        setAppointmentDate('');
        setAppointmentTime('');
  
        // Update the list of upcoming appointments (you can add logic to fetch the updated list from the server)
        setUpcomingAppointments([
          ...upcomingAppointments,
          { date: appointmentDate, time: appointmentTime, doctorName: selectedDoctor, department: selectedDepartment }
        ]);
      } else {
        alert(response.data.message); // Show error message from backend if any
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again later.');
    } finally {
      setBookingLoading(false); // Stop loading after booking attempt
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header>
        <button onClick={() => setActiveTab('medicalHistory')}>Medical History</button>
        <button onClick={() => setActiveTab('bookAppointment')}>Book Appointment</button>
        <button onClick={() => setActiveTab('upcomingAppointments')}>Upcoming Appointments</button>
        <button className="logout-button" onClick={() => navigate('/')}>
        🔒 Logout
        </button>
      </header>

      <div className="content">
        {activeTab === 'medicalHistory' && (
          <div className="content-section">
            <h2>Medical History</h2>
            {error && <p className="error">{error}</p>}
            <table>
              <thead>
                <tr>
                  <th>Reason for Visit</th>
                  <th>Doctor's Name</th>
                  <th>Prescription</th>
                </tr>
              </thead>
              <tbody>
                {medicalHistory.length > 0 ? (
                  medicalHistory.map((history, index) => (
                    <tr key={index}>
                      <td>{history.reasonForVisit}</td>
                      <td>{history.doctorName}</td>
                      <td>
                        <button onClick={() => handleShowPrescription(history.prescription)}>
                          Show Prescription
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No medical history available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookAppointment' && (
          <div className="content-section">
            <h2>Book an Appointment</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBookAppointment();
              }}
            >
              <div>
                <label>Select Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedDoctor(''); // Reset doctor when department changes
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((department, index) => (
                    <option key={index} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDepartment && (
                <div>
                  <label>Select Doctor:</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">Select Doctor</option>
                    {departments
                      .find((dept) => dept.name === selectedDepartment)
                      ?.doctors?.map((doctor, index) => (
                        <option key={index} value={doctor}>
                          {doctor}
                        </option>
                      )) || <option>No doctors available</option>}
                  </select>
                </div>
              )}

              <div>
                <label>Select Date:</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>

              <div>
                <label>Select Time:</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>

              <button type="submit" disabled={bookingLoading}>
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'upcomingAppointments' && (
          <div className="content-section">
            <h2>Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <ul>
                {upcomingAppointments.map((appointment, index) => (
                  <li key={index}>
                    {appointment.date} at {appointment.time} with Dr. {appointment.doctorName} ({appointment.department})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </div>
        )}
      </div>

      {showPrescription && (
        <div className="modal">
          <div className="modal-content">
            <h3>Prescription</h3>
            <p>{prescriptionData || "No prescription available."}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}

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
            <p>🏥 123 Health Street, Cityville</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;