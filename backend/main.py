from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
import logging

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///patients.db'  # Replace with your database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)  # Allow cross-origin requests from React

# Patient model
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    patient_id = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<Patient {self.patient_id}>"

# Medical History Model
class MedicalHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    reason_for_visit = db.Column(db.String(200), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    prescription = db.Column(db.String(100), nullable=False)

    patient = db.relationship('Patient', backref=db.backref('medical_histories', lazy=True))

# Appointment Model
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(10), nullable=False)

    patient = db.relationship('Patient', backref=db.backref('appointments', lazy=True))

# Department Model
class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    doctors = db.Column(db.String(200), nullable=False)  # Comma-separated list of doctors

# Create the database (Only run once, or when needed)
with app.app_context():
    db.create_all()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Received data: {data}")  # Add this to log the received data
    patient_id = data.get('patient_id')
    password = data.get('password')

    if not patient_id or not password:
        return jsonify({"success": False, "message": "Patient ID and Password are required"}), 400

    patient = Patient.query.filter_by(patient_id=patient_id).first()

    if patient:
        # Compare the hashed password using check_password_hash
        if check_password_hash(patient.password_hash, password):
            return jsonify({"success": True, "message": "Login successful"})
        else:
            return jsonify({"success": False, "message": "Invalid Patient ID or Password"}), 400
    else:
        return jsonify({"success": False, "message": "Patient ID not found"}), 400

# Endpoint for medical history
@app.route('/api/medical-history/<patient_id>', methods=['GET'])
def get_medical_history(patient_id):
    medical_history = MedicalHistory.query.filter_by(patient_id=patient_id).all()
    history_data = [
        {
            "reason_for_visit": record.reason_for_visit,
            "doctor_name": record.doctor_name,
            "prescription": record.prescription
        }
        for record in medical_history
    ]
    return jsonify(history_data)

# Endpoint for departments and doctors
@app.route('/api/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    department_data = [
        {"name": department.name, "doctors": department.doctors.split(',')}
        for department in departments
    ]
    return jsonify(department_data)

# Endpoint for upcoming appointments
@app.route('/api/upcoming-appointments/<patient_id>', methods=['GET'])
def get_upcoming_appointments(patient_id):
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()
    appointments_data = [
        {
            "doctor_name": app.doctor_name,
            "department": app.department,
            "date": app.date,
            "time": app.time
        }
        for app in appointments
    ]
    return jsonify(appointments_data)

# Endpoint for booking appointments
@app.route('/api/book-appointment', methods=['POST'])
def book_appointment():
    data = request.get_json()
    patient_id = data.get('patient_id')
    doctor_name = data.get('doctor_name')
    department = data.get('department')
    date = data.get('date')
    time = data.get('time')

    if not patient_id or not doctor_name or not department or not date or not time:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    new_appointment = Appointment(
        patient_id=patient_id, doctor_name=doctor_name, department=department, date=date, time=time
    )
    db.session.add(new_appointment)
    db.session.commit()

    return jsonify({"success": True, "message": "Appointment booked successfully"}), 201

# Reset password endpoint
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    patient_id = data.get('patient_id')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not patient_id or not new_password or not confirm_password:
        return jsonify({"success": False, "message": "Patient ID, new password, and confirmation are required"}), 400
    
    if new_password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    # Find the patient
    patient = Patient.query.filter_by(patient_id=patient_id).first()

    if patient:
        # Hash the new password
        new_password_hash = hashlib.sha256(new_password.encode('utf-8')).hexdigest()
        patient.password_hash = new_password_hash

        db.session.commit()

        return jsonify({"success": True, "message": "Password has been reset successfully"})
    else:
        return jsonify({"success": False, "message": "Patient ID not found"}), 400

# Register new patient
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        password = data.get('password')
        name = data.get('name')

        if not patient_id or not password or not name:
            raise ValueError("Patient ID, Password, and Name are required.")

        # Check if the patient ID already exists
        existing_patient = Patient.query.filter_by(patient_id=patient_id).first()
        if existing_patient:
            return jsonify({"success": False, "message": "Patient ID already exists"}), 400

        # Hash the password
        password_hash = generate_password_hash(password)
        new_patient = Patient(name=name, patient_id=patient_id, password_hash=password_hash)

        db.session.add(new_patient)
        db.session.commit()

        return jsonify({"success": True, "message": "Registration successful. Please log in."})
    except Exception as e:
        logging.error(f"Error occurred: {e}")
        db.session.rollback()
        return jsonify({"success": False, "message": f"An error occurred during registration: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
