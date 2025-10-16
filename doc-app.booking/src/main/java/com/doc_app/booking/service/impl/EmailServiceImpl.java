package com.doc_app.booking.service.impl;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        Map<String, Object> templateModel = new HashMap<>();
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        templateModel.put("patientName", patient.getFirstName() + " " + patient.getLastName());
        templateModel.put("doctorName", doctor.getName());
        templateModel.put("hospitalName", doctor.getHospital().getName());
        templateModel.put("hospitalAddress", doctor.getHospital().getAddress());
        templateModel.put("appointmentDate", formatDate(appointment.getAppointmentDateTime()));
        templateModel.put("appointmentTime", formatTime(appointment.getAppointmentDateTime()));
        templateModel.put("appointmentLink", baseUrl + "/appointments/" + appointment.getId());
        templateModel.put("currentYear", LocalDateTime.now().getYear());

        String htmlContent = processTemplate("email/appointment-confirmation", templateModel);
        sendEmail(appointment.getPatient().getEmail(), "Appointment Confirmation", htmlContent);
    }

    @Override
    public void sendAppointmentReminder(Appointment appointment) {
        Map<String, Object> templateModel = new HashMap<>();
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        templateModel.put("patientName", patient.getFirstName() + " " + patient.getLastName());
        templateModel.put("doctorName", doctor.getName());
        templateModel.put("hospitalName", doctor.getHospital().getName());
        templateModel.put("hospitalAddress", doctor.getHospital().getAddress());
        templateModel.put("appointmentDate", formatDate(appointment.getAppointmentDateTime()));
        templateModel.put("appointmentTime", formatTime(appointment.getAppointmentDateTime()));
        templateModel.put("appointmentLink", baseUrl + "/appointments/" + appointment.getId());
        templateModel.put("currentYear", LocalDateTime.now().getYear());

        String htmlContent = processTemplate("email/appointment-reminder", templateModel);
        sendEmail(appointment.getPatient().getEmail(), "Appointment Reminder", htmlContent);
    }

    @Override
    public void sendAppointmentCancellation(Appointment appointment) {
        Map<String, Object> templateModel = new HashMap<>();
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        templateModel.put("patientName", patient.getFirstName() + " " + patient.getLastName());
        templateModel.put("doctorName", doctor.getName());
        templateModel.put("hospitalName", doctor.getHospital().getName());
        templateModel.put("appointmentDate", formatDate(appointment.getAppointmentDateTime()));
        templateModel.put("appointmentTime", formatTime(appointment.getAppointmentDateTime()));
        templateModel.put("bookingLink", baseUrl + "/appointments/book");
        templateModel.put("currentYear", LocalDateTime.now().getYear());

        String htmlContent = processTemplate("email/appointment-cancellation", templateModel);
        sendEmail(appointment.getPatient().getEmail(), "Appointment Cancellation", htmlContent);
    }

    @Override
    public void sendPatientRegistrationConfirmation(Patient patient) {
        // TODO: Implement patient registration email template and logic
    }

    @Override
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String processTemplate(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process(templateName, context);
    }

    private String formatDate(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy"));
    }

    private String formatTime(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("h:mm a"));
    }
}