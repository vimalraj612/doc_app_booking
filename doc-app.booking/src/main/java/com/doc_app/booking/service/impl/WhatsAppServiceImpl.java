package com.doc_app.booking.service.impl;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class WhatsAppServiceImpl implements WhatsAppService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${whatsapp.api.url:https://graph.facebook.com/v18.0}")
    private String whatsappApiUrl;

    @Value("${whatsapp.api.token}")
    private String whatsappApiToken;

    @Value("${whatsapp.phone.number.id}")
    private String phoneNumberId;

    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        String message = String.format(
            "🏥 *Appointment Confirmed* 🏥\n\n" +
            "Dear %s,\n\n" +
            "Your appointment has been successfully booked:\n\n" +
            "👨‍⚕️ *Doctor:* %s\n" +
            "🏥 *Hospital:* %s\n" +
            "📅 *Date & Time:* %s\n" +
            "🆔 *Appointment ID:* %s\n\n" +
            "Please arrive 15 minutes before your appointment time.\n\n" +
            "Thank you for choosing our service! 🙏",
            appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getHospital().getName(),
            appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a")),
            appointment.getId()
        );
        
        sendWhatsAppMessage(appointment.getPatient().getPhoneNumber(), message);
    }

    @Override
    public void sendAppointmentReminder(Appointment appointment) {
        String message = String.format(
            "⏰ *Appointment Reminder* ⏰\n\n" +
            "Dear %s,\n\n" +
            "This is a reminder for your upcoming appointment:\n\n" +
            "👨‍⚕️ *Doctor:* %s\n" +
            "🏥 *Hospital:* %s\n" +
            "📅 *Date & Time:* %s\n" +
            "🆔 *Appointment ID:* %s\n\n" +
            "Please arrive 15 minutes before your appointment time.\n\n" +
            "See you soon! 👋",
            appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getHospital().getName(),
            appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a")),
            appointment.getId()
        );
        
        sendWhatsAppMessage(appointment.getPatient().getPhoneNumber(), message);
    }

    @Override
    public void sendAppointmentCancellation(Appointment appointment) {
        String message = String.format(
            "❌ *Appointment Cancelled* ❌\n\n" +
            "Dear %s,\n\n" +
            "Your appointment has been cancelled:\n\n" +
            "👨‍⚕️ *Doctor:* %s\n" +
            "🏥 *Hospital:* %s\n" +
            "📅 *Date & Time:* %s\n" +
            "🆔 *Appointment ID:* %s\n\n" +
            "If you need to reschedule, please contact us.\n\n" +
            "Thank you for your understanding. 🙏",
            appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getHospital().getName(),
            appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a")),
            appointment.getId()
        );
        
        sendWhatsAppMessage(appointment.getPatient().getPhoneNumber(), message);
    }

    @Override
    public void sendPatientRegistrationConfirmation(Patient patient) {
        String message = String.format(
            "🎉 *Welcome to Our Healthcare System* 🎉\n\n" +
            "Dear %s,\n\n" +
            "Your registration has been completed successfully!\n\n" +
            "📧 *Email:* %s\n" +
            "📱 *Phone:* %s\n\n" +
            "You can now book appointments with our doctors.\n\n" +
            "Welcome aboard! 🏥✨",
            patient.getFirstName() + " " + patient.getLastName(),
            patient.getEmail(),
            patient.getPhoneNumber()
        );
        
        sendWhatsAppMessage(patient.getPhoneNumber(), message);
    }

    @Override
    public void sendLastVisitedDoctorMessage(String phoneNumber, String doctorName, String patientName) {
        String message = String.format(
            "👋 Hello %s!\n\n" +
            "🏥 *Last Visited Doctor:* %s\n\n" +
            "Would you like to book an appointment with Dr. %s again?\n\n" +
            "Or if you need a different doctor, you can search by:\n" +
            "• 👨‍⚕️ Doctor name\n" +
            "• 🏥 Hospital name\n" +
            "• 🩺 Specialization\n" +
            "• 📱 Doctor mobile number\n\n" +
            "Please reply with your choice or search criteria.",
            patientName,
            doctorName,
            doctorName
        );
        
        sendWhatsAppMessage(phoneNumber, message);
    }

    @Override
    public void sendDoctorSearchInstructions(String phoneNumber) {
        String message = 
            "🔍 *Doctor Search* 🔍\n\n" +
            "Please search for a doctor by typing:\n\n" +
            "• 👨‍⚕️ Doctor name (e.g., 'Dr. Smith')\n" +
            "• 🏥 Hospital name (e.g., 'City Hospital')\n" +
            "• 🩺 Specialization (e.g., 'Cardiology')\n" +
            "• 📱 Doctor mobile number\n\n" +
            "Just type any of the above and I'll find matching doctors for you! 🔍✨";
        
        sendWhatsAppMessage(phoneNumber, message);
    }

    @Override
    public void sendAvailableDates(String phoneNumber, String doctorName, String dates) {
        String message = String.format(
            "📅 *Available Dates for Dr. %s* 📅\n\n" +
            "%s\n\n" +
            "Please select a date by replying with the date number.",
            doctorName,
            dates
        );
        
        sendWhatsAppMessage(phoneNumber, message);
    }

    @Override
    public void sendAvailableSlots(String phoneNumber, String selectedDate, String slots) {
        String message = String.format(
            "⏰ *Available Time Slots for %s* ⏰\n\n" +
            "%s\n\n" +
            "Please select a time slot by replying with the slot number.",
            selectedDate,
            slots
        );
        
        sendWhatsAppMessage(phoneNumber, message);
    }

    @Override
    public void sendBookingConfirmation(String phoneNumber, Appointment appointment) {
        sendAppointmentConfirmation(appointment);
    }

    @Override
    public void sendWhatsAppMessage(String phoneNumber, String message) {
        try {
            String url = String.format("%s/%s/messages", whatsappApiUrl, phoneNumberId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(whatsappApiToken);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("messaging_product", "whatsapp");
            requestBody.put("to", phoneNumber);
            requestBody.put("type", "text");
            
            Map<String, String> textContent = new HashMap<>();
            textContent.put("body", message);
            requestBody.put("text", textContent);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("WhatsApp message sent successfully to: {}", phoneNumber);
            } else {
                log.error("Failed to send WhatsApp message. Status: {}", response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Error sending WhatsApp message to {}: {}", phoneNumber, e.getMessage(), e);
        }
    }
}