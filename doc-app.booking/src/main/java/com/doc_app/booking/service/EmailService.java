package com.doc_app.booking.service;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Patient;

public interface EmailService {
    void sendAppointmentConfirmation(Appointment appointment);

    void sendAppointmentReminder(Appointment appointment);

    void sendAppointmentCancellation(Appointment appointment);

    void sendPatientRegistrationConfirmation(Patient patient);
    
    void sendOTPNotification(String email, String otp, String roleDisplayName, int expiryMinutes);

    void sendEmail(String to, String subject, String htmlContent);
}