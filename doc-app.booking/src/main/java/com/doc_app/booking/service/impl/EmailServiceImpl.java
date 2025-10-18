package com.doc_app.booking.service.impl;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@docapp.com}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            Context context = new Context();
            context.setVariable("patient", appointment.getPatient());
            context.setVariable("doctor", appointment.getDoctor());
            context.setVariable("appointment", appointment);
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("email/appointment-confirmation", context);
            
            sendEmail(
                appointment.getPatient().getEmail(),
                "Appointment Confirmation - " + appointment.getDoctor().getName(),
                htmlContent
            );
            
            log.info("Appointment confirmation email sent to: {}", appointment.getPatient().getEmail());
        } catch (Exception e) {
            log.error("Failed to send appointment confirmation email to: {}", 
                appointment.getPatient().getEmail(), e);
        }
    }

    @Override
    public void sendAppointmentReminder(Appointment appointment) {
        try {
            Context context = new Context();
            context.setVariable("patient", appointment.getPatient());
            context.setVariable("doctor", appointment.getDoctor());
            context.setVariable("appointment", appointment);
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("email/appointment-reminder", context);
            
            sendEmail(
                appointment.getPatient().getEmail(),
                "Appointment Reminder - " + appointment.getDoctor().getName(),
                htmlContent
            );
            
            log.info("Appointment reminder email sent to: {}", appointment.getPatient().getEmail());
        } catch (Exception e) {
            log.error("Failed to send appointment reminder email to: {}", 
                appointment.getPatient().getEmail(), e);
        }
    }

    @Override
    public void sendAppointmentCancellation(Appointment appointment) {
        try {
            Context context = new Context();
            context.setVariable("patient", appointment.getPatient());
            context.setVariable("doctor", appointment.getDoctor());
            context.setVariable("appointment", appointment);
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("email/appointment-cancellation", context);
            
            sendEmail(
                appointment.getPatient().getEmail(),
                "Appointment Cancelled - " + appointment.getDoctor().getName(),
                htmlContent
            );
            
            log.info("Appointment cancellation email sent to: {}", appointment.getPatient().getEmail());
        } catch (Exception e) {
            log.error("Failed to send appointment cancellation email to: {}", 
                appointment.getPatient().getEmail(), e);
        }
    }

    @Override
    public void sendPatientRegistrationConfirmation(Patient patient) {
        try {
            Context context = new Context();
            context.setVariable("patient", patient);
            context.setVariable("baseUrl", baseUrl);

            // Using appointment-confirmation template as a fallback since we don't have a registration template
            String htmlContent = templateEngine.process("email/appointment-confirmation", context);
            
            sendEmail(
                patient.getEmail(),
                "Welcome to Doc App - Registration Confirmation",
                htmlContent
            );
            
            log.info("Patient registration confirmation email sent to: {}", patient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send patient registration confirmation email to: {}", 
                patient.getEmail(), e);
        }
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
            
            log.info("Email sent successfully to: {} with subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {} with subject: {}", to, subject, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}