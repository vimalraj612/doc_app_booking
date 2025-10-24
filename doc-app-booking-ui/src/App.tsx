import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { HospitalDashboard } from './components/HospitalDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'superadmin' | null;


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  hospitalName: string;
  email: string;
  photo: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  email: string;
  photo: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isBooked: boolean;
  patientId?: string;
  patientName?: string;
}

export interface TimeSlotTemplate {
  id: string;
  doctorId: string;
  name: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  prescription?: string;
  notes?: string;
  rating?: number;
  review?: string;
}



function App() {
  // ...existing code...

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [docPhoneNumber, setDocPhoneNumber] = useState<string | null>(null);

  // Parse docPhoneNumber from URL and store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get('doctor');
    if (doctorId) {
      setSelectedDoctorId(doctorId);
    }
    let docPhone = params.get('docPhoneNumber');
    if (docPhone) {
      if (!docPhone.startsWith('+')) {
        docPhone = '+' + docPhone;
      }
      setDocPhoneNumber(docPhone);
      localStorage.setItem('docPhoneNumber', docPhone);
    } else {
      // Try to get from localStorage if not in URL
      const stored = localStorage.getItem('docPhoneNumber');
      if (stored) setDocPhoneNumber(stored);
    }
  }, []);
  const [hospitals, setHospitals] = useState<Hospital[]>([
    { id: 'h1', name: 'City General Hospital', address: '123 Main St, New York', email: 'info@citygeneral.com', photo: 'https://images.unsplash.com/photo-1719934398679-d764c1410770?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGJ1aWxkaW5nJTIwbW9kZXJufGVufDF8fHx8MTc2MTAyNzE1N3ww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'h2', name: 'Metro Medical Center', address: '456 Park Ave, New York', email: 'contact@metromedical.com', photo: 'https://images.unsplash.com/photo-1583051521903-42600bca02eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2VudGVyJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzYxMDM2MTQzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  ]);
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 'd1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology', hospitalId: 'h1', hospitalName: 'City General Hospital', email: 'sarah.j@hospital.com', photo: 'https://images.unsplash.com/photo-1719610894782-7b376085e200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjEwMzYxNDN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'd2', name: 'Dr. Michael Chen', specialization: 'Neurology', hospitalId: 'h1', hospitalName: 'City General Hospital', email: 'michael.c@hospital.com', photo: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjEwMzMzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'd3', name: 'Dr. Emily Williams', specialization: 'Pediatrics', hospitalId: 'h2', hospitalName: 'Metro Medical Center', email: 'emily.w@hospital.com', photo: 'https://images.unsplash.com/photo-1719610894782-7b376085e200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjEwMzYxNDN8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: 'd4', name: 'Dr. James Brown', specialization: 'Orthopedics', hospitalId: 'h2', hospitalName: 'Metro Medical Center', email: 'james.b@hospital.com', photo: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjEwMzMzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'a1',
      patientId: 'p1',
      patientName: 'John Doe',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Johnson',
      hospitalId: 'h1',
      hospitalName: 'City General Hospital',
      date: '2025-10-25',
      time: '10:00 AM',
      status: 'scheduled'
    }
  ]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: 's1', doctorId: 'd1', date: '2025-10-25', time: '10:00 AM', isBooked: true, patientId: 'p1', patientName: 'John Doe' },
    { id: 's2', doctorId: 'd1', date: '2025-10-25', time: '11:00 AM', isBooked: false },
    { id: 's3', doctorId: 'd1', date: '2025-10-25', time: '2:00 PM', isBooked: false },
    { id: 's4', doctorId: 'd2', date: '2025-10-26', time: '9:00 AM', isBooked: false },
    { id: 's5', doctorId: 'd2', date: '2025-10-26', time: '10:00 AM', isBooked: false },
    { id: 's6', doctorId: 'd3', date: '2025-10-27', time: '11:00 AM', isBooked: false },
  ]);
  
  const [timeSlotTemplates, setTimeSlotTemplates] = useState<TimeSlotTemplate[]>([]);
  
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  const handleLogin = (email: string, password: string, role: UserRole) => {
  // Save token if present in localStorage (for real API, get from response)
    if (role === 'patient') {
      setCurrentUser({ id: 'p1', name: 'John Doe', email, role });
    } else if (role === 'doctor') {
      const doctor = doctors.find(d => d.email === email);
      setCurrentUser({ id: doctor?.id || 'd1', name: doctor?.name || 'Dr. Sarah Johnson', email, role });
    } else if (role === 'hospital') {
      const hospital = hospitals.find(h => h.email === email);
      setCurrentUser({ id: hospital?.id || 'h1', name: hospital?.name || 'City General Hospital', email, role });
    } else if (role === 'superadmin') {
      setCurrentUser({ id: 'admin1', name: 'Super Admin', email, role });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('docPhoneNumber');
    setDocPhoneNumber(null);
  };

  const handleBookAppointment = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
    setTimeSlots(timeSlots.map(slot => 
      slot.id === appointment.id 
        ? { ...slot, isBooked: true, patientId: appointment.patientId, patientName: appointment.patientName }
        : slot
    ));
  };

  const handleAddSlot = (slot: TimeSlot) => {
    setTimeSlots([...timeSlots, { ...slot, id: `s${timeSlots.length + 1}` }]);
  };

  const handleAddDoctor = (doctor: Doctor) => {
    setDoctors([...doctors, { ...doctor, id: `d${doctors.length + 1}` }]);
  };

  const handleAddHospital = (hospital: Hospital) => {
    setHospitals([...hospitals, { ...hospital, id: `h${hospitals.length + 1}` }]);
  };

  const handleDeleteDoctor = (doctorId: string) => {
    setDoctors(doctors.filter(d => d.id !== doctorId));
    setTimeSlots(timeSlots.filter(s => s.doctorId !== doctorId));
    setAppointments(appointments.filter(a => a.doctorId !== doctorId));
  };

  const handleDeleteHospital = (hospitalId: string) => {
    setHospitals(hospitals.filter(h => h.id !== hospitalId));
    setDoctors(doctors.filter(d => d.hospitalId !== hospitalId));
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
    ));
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      setTimeSlots(timeSlots.map(slot => 
        slot.doctorId === appointment.doctorId && 
        slot.date === appointment.date && 
        slot.time === appointment.time
          ? { ...slot, isBooked: false, patientId: undefined, patientName: undefined }
          : slot
      ));
    }
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    ));
  };

  const handleAddPrescription = (appointmentId: string, prescription: string, notes: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, prescription, notes, status: 'completed' as const } : apt
    ));
  };

  const handleAddMedicalRecord = (record: MedicalRecord) => {
    setMedicalRecords([...medicalRecords, { ...record, id: `mr${medicalRecords.length + 1}` }]);
  };

  const handleRateDoctor = (appointmentId: string, rating: number, review: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, rating, review } : apt
    ));
  };

  const handleRescheduleAppointment = (appointmentId: string, newSlotId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    const newSlot = timeSlots.find(s => s.id === newSlotId);
    
    if (appointment && newSlot) {
      // Free up old slot
      setTimeSlots(timeSlots.map(slot => 
        slot.doctorId === appointment.doctorId && 
        slot.date === appointment.date && 
        slot.time === appointment.time
          ? { ...slot, isBooked: false, patientId: undefined, patientName: undefined }
          : slot.id === newSlotId
          ? { ...slot, isBooked: true, patientId: appointment.patientId, patientName: appointment.patientName }
          : slot
      ));
      
      // Update appointment
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, date: newSlot.date, time: newSlot.time } 
          : apt
      ));
    }
  };

  const handleAddTimeSlotTemplate = (template: TimeSlotTemplate) => {
    setTimeSlotTemplates([...timeSlotTemplates, { ...template, id: `tpl${timeSlotTemplates.length + 1}` }]);
  };

  const handleGenerateSlotsFromTemplate = (templateId: string, startDate: string, endDate: string) => {
    const template = timeSlotTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newSlots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Iterate through each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      
      // Check if this day is in the template
      if (template.daysOfWeek.includes(dayOfWeek)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Parse start and end times
        const [startHour, startMin] = template.startTime.split(':').map(Number);
        const [endHour, endMin] = template.endTime.split(':').map(Number);
        
        // Generate slots for this day
        let currentTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        
        while (currentTime < endTime) {
          const hour = Math.floor(currentTime / 60);
          const min = currentTime % 60;
          const timeStr = `${hour > 12 ? hour - 12 : hour}:${min.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
          
          newSlots.push({
            id: `s${timeSlots.length + newSlots.length + 1}`,
            doctorId: template.doctorId,
            date: dateStr,
            time: timeStr,
            isBooked: false
          });
          
          currentTime += template.slotDuration;
        }
      }
    }
    
    setTimeSlots([...timeSlots, ...newSlots]);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {currentUser.role === 'patient' && (
        <PatientDashboard onLogout={handleLogout} />
      )}
      {currentUser.role === 'doctor' && (
        <DoctorDashboard 
          user={currentUser}
          doctor={doctors.find(d => d.id === currentUser.id) || doctors[0]}
          appointments={appointments.filter(a => a.doctorId === currentUser.id)}
          timeSlots={timeSlots.filter(s => s.doctorId === currentUser.id)}
          onLogout={handleLogout}
          onAddSlot={handleAddSlot}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onAddPrescription={handleAddPrescription}
          onAddMedicalRecord={handleAddMedicalRecord}
        />
      )}
      {currentUser.role === 'hospital' && (
        <HospitalDashboard 
          user={currentUser}
          doctors={doctors.filter(d => d.hospitalId === currentUser.id)}
          appointments={appointments.filter(a => a.hospitalId === currentUser.id)}
          hospitals={hospitals}
          onLogout={handleLogout}
          onAddDoctor={handleAddDoctor}
          onDeleteDoctor={handleDeleteDoctor}
        />
      )}
      {currentUser.role === 'superadmin' && (
        <SuperAdminDashboard 
          user={currentUser}
          hospitals={hospitals}
          doctors={doctors}
          appointments={appointments}
          timeSlots={timeSlots}
          timeSlotTemplates={timeSlotTemplates}
          onLogout={handleLogout}
          onAddHospital={handleAddHospital}
          onDeleteHospital={handleDeleteHospital}
          onDeleteDoctor={handleDeleteDoctor}
          onAddTimeSlotTemplate={handleAddTimeSlotTemplate}
          onGenerateSlotsFromTemplate={handleGenerateSlotsFromTemplate}
        />
      )}
    </div>
  );
}

export default App;
