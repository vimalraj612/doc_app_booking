package com.doc_app.booking.service;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Patient;

public interface WhatsAppService {
    void sendAppointmentConfirmation(Appointment appointment);
    
    void sendAppointmentReminder(Appointment appointment);
    
    void sendAppointmentCancellation(Appointment appointment);
    
    void sendPatientRegistrationConfirmation(Patient patient);
    
    void sendWhatsAppMessage(String phoneNumber, String message);
    
    // WhatsApp Booking Flow Methods
    void sendLastVisitedDoctorMessage(String phoneNumber, String doctorName, String patientName);
    
    void sendDoctorSearchInstructions(String phoneNumber);
    
    void sendAvailableDates(String phoneNumber, String doctorName, String dates);
    
    void sendAvailableSlots(String phoneNumber, String selectedDate, String slots);
    
    void sendBookingConfirmation(String phoneNumber, Appointment appointment);
}