package com.doc_app.booking.controller;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.SlotDTO;
import com.doc_app.booking.service.CommonService;
import com.doc_app.booking.service.SlotService;
import com.doc_app.booking.service.WhatsAppService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/whatsapp")
@RequiredArgsConstructor
public class WhatsAppBookingController {

    private final WhatsAppService whatsAppService;
    private final CommonService commonService;
    private final SlotService slotService;

    @Value("${whatsapp.booking.number}")
    private String whatsappBookingNumber;

    @Value("${whatsapp.verify.token}")
    private String verifyToken;

    // ✅ ALL OLD APIs REMOVED - EVERYTHING HANDLED BY UNIFIED WEBHOOK BELOW ✅

    @Operation(summary = "Handle ALL WhatsApp messages - Unified Webhook")
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload) {
        try {
            log.info("Received WhatsApp webhook: {}", payload);

            // Parse WhatsApp message
            String patientPhone = extractPatientPhoneFromPayload(payload);
            String messageText = extractMessageTextFromPayload(payload);
            String receivingNumber = extractReceivingNumberFromPayload(payload);

            // Single unified routing logic
            handleUnifiedWhatsAppFlow(patientPhone, messageText, receivingNumber);

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            log.error("Error processing WhatsApp webhook", e);
            return ResponseEntity.internalServerError().body("Error");
        }
    }

    /**
     * UNIFIED WHATSAPP FLOW - Handles ALL booking scenarios in one method
     * No separate APIs needed - everything routes through this single method
     */
    private void handleUnifiedWhatsAppFlow(String patientPhone, String messageText, String receivingNumber) {
        try {
            String cleanMessage = messageText.toLowerCase().trim();

            if ("hi".equals(cleanMessage) || "hello".equals(cleanMessage)) {
                handleHiMessage(patientPhone, receivingNumber);

            } else if (isNumeric(cleanMessage)) {
                handleNumericMessage(patientPhone, receivingNumber, Integer.parseInt(cleanMessage));

            } else {
                handleTextMessage(patientPhone, receivingNumber, cleanMessage);
            }

        } catch (Exception e) {
            log.error("Error in unified WhatsApp flow", e);
            whatsAppService.sendWhatsAppMessage(patientPhone,
                    "❌ Sorry, I didn't understand. Type 'hi' to start booking.");
        }
    }

    private void handleHiMessage(String patientPhone, String receivingNumber) {
        if (whatsappBookingNumber.equals(receivingNumber)) {
            // Booking number: Start with search instructions
            whatsAppService.sendDoctorSearchInstructions(patientPhone);
        } else {
            // Doctor's direct number: Show doctor info and dates immediately
            showDoctorInfoAndDates(patientPhone, receivingNumber);
        }
    }

    private void handleNumericMessage(String patientPhone, String receivingNumber, int number) {
        if (whatsappBookingNumber.equals(receivingNumber)) {
            // Booking number: Could be doctor selection (need session context)
            whatsAppService.sendWhatsAppMessage(patientPhone,
                    "Please start by typing 'hi' to search for doctors.");
        } else {
            // Doctor's direct number: Date/slot selection
            if (number >= 1 && number <= 7) {
                showAvailableSlots(patientPhone, receivingNumber, number);
            } else if (number >= 1 && number <= 10) {
                requestPatientIdForBooking(patientPhone, receivingNumber, number);
            }
        }
    }

    private void handleTextMessage(String patientPhone, String receivingNumber, String message) {
        if (whatsappBookingNumber.equals(receivingNumber)) {
            // Booking number: Treat as doctor search
            searchForDoctors(patientPhone, message);
        } else {
            // Doctor's direct number: Invalid text
            whatsAppService.sendWhatsAppMessage(patientPhone,
                    "👋 Hi! Please type 'hi' to see available appointment dates.");
        }
    }

    private void showDoctorInfoAndDates(String patientPhone, String doctorPhone) {
        try {
            List<DoctorDTO> doctors = commonService.searchDoctors(doctorPhone, null);
            if (doctors.isEmpty()) {
                whatsAppService.sendWhatsAppMessage(patientPhone,
                        "❌ Doctor not found in our system.");
                return;
            }

            DoctorDTO doctor = doctors.get(0);
            StringBuilder message = new StringBuilder();
            message.append("👋 Welcome to Dr. ").append(doctor.getName()).append("'s clinic!\n\n");
            message.append("👨‍⚕️ *Doctor:* Dr. ").append(doctor.getName()).append("\n");
            message.append("🩺 *Specialization:* ").append(doctor.getSpecialization()).append("\n");
            message.append("🏥 *Hospital:* ").append(doctor.getHospitalName()).append("\n\n");
            message.append("📅 *Available Dates:*\n\n");

            LocalDate today = LocalDate.now();
            for (int i = 1; i <= 7; i++) {
                LocalDate date = today.plusDays(i);
                message.append(String.format("%d. 📅 %s (%s)\n", i,
                        date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                        date.getDayOfWeek().toString()));
            }

            message.append("\n💬 Reply with date number (1-7) to see slots!");
            whatsAppService.sendWhatsAppMessage(patientPhone, message.toString());

        } catch (Exception e) {
            log.error("Error showing doctor info", e);
        }
    }

    private void showAvailableSlots(String patientPhone, String doctorPhone, int dateNumber) {
        try {
            List<DoctorDTO> doctors = commonService.searchDoctors(doctorPhone, null);
            if (doctors.isEmpty())
                return;

            DoctorDTO doctor = doctors.get(0);
            LocalDate selectedDate = LocalDate.now().plusDays(dateNumber);
            List<SlotDTO> availableSlots = slotService.getAvailableSlots(doctor.getId(), selectedDate);

            if (availableSlots.isEmpty()) {
                whatsAppService.sendWhatsAppMessage(patientPhone,
                        "😔 No slots available for " + selectedDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                return;
            }

            StringBuilder message = new StringBuilder();
            message.append("⏰ *Available Slots - ")
                    .append(selectedDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("*\n\n");

            for (int i = 0; i < availableSlots.size(); i++) {
                SlotDTO slot = availableSlots.get(i);
                message.append(String.format("%d. ⏰ %s - %s\n", i + 1,
                        slot.getStart().format(DateTimeFormatter.ofPattern("hh:mm a")),
                        slot.getEnd().format(DateTimeFormatter.ofPattern("hh:mm a"))));
            }

            message.append("\n💬 Reply with slot number to book!");
            whatsAppService.sendWhatsAppMessage(patientPhone, message.toString());

        } catch (Exception e) {
            log.error("Error showing slots", e);
        }
    }

    private void searchForDoctors(String patientPhone, String query) {
        try {
            // Pass null for specialization to search all
            List<DoctorDTO> doctors = commonService.searchDoctors(query, null);
            if (doctors.isEmpty()) {
                whatsAppService.sendWhatsAppMessage(patientPhone,
                        "❌ No doctors found. Try different search term.");
                return;
            }

            StringBuilder message = new StringBuilder("🔍 *Search Results*\n\n");
            for (int i = 0; i < Math.min(doctors.size(), 5); i++) {
                DoctorDTO doctor = doctors.get(i);
                message.append(String.format("%d. 👨‍⚕️ Dr. %s\n   🩺 %s\n\n",
                        i + 1, doctor.getName(), doctor.getSpecialization()));
            }
            message.append("Reply with doctor number to proceed.");
            whatsAppService.sendWhatsAppMessage(patientPhone, message.toString());

        } catch (Exception e) {
            log.error("Error searching doctors", e);
        }
    }

    private void requestPatientIdForBooking(String patientPhone, String doctorPhone, int slotNumber) {
        whatsAppService.sendWhatsAppMessage(patientPhone,
                "Please provide your Patient ID to complete booking for slot " + slotNumber + ":");
    }


    private boolean isNumeric(String str) {
        try {
            Integer.parseInt(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    // These methods parse WhatsApp webhook JSON (implement based on WhatsApp API
    // docs)
    private String extractPatientPhoneFromPayload(String payload) {
        // Parse JSON to get sender's phone number
        return "+1234567890"; // Placeholder
    }

    private String extractMessageTextFromPayload(String payload) {
        // Parse JSON to get message text
        return "hi"; // Placeholder
    }

    private String extractReceivingNumberFromPayload(String payload) {
        // Parse JSON to get receiving number (doctor's number)
        return "+0987654321"; // Placeholder
    }

    @Operation(summary = "Verify WhatsApp webhook")
    @GetMapping("/webhook")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.challenge") String challenge,
            @RequestParam("hub.verify_token") String token) {

        // Verify token using configured value
        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            return ResponseEntity.ok(challenge);
        }

        return ResponseEntity.status(403).body("Forbidden");
    }
}