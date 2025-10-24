package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateAppointmentRequest {
    @NotNull
    @Positive
    private Long doctorId;

    // Patient identification by phone number (unique identifier)
    @NotNull
    @Size(min = 10, max = 15, message = "Phone number must be between 10-15 characters")
    private String patientPhone;

    @NotNull
    @Size(min = 2, max = 150, message = "Patient name must be between 2-150 characters")
    private String patientName;

    @NotNull
    @FutureOrPresent
    private LocalDateTime appointmentDateTime;

    // optional: if provided, book this slot
    @Positive
    private Long slotId;

    @Size(max = 500)
    private String reason;

    // Appointment type (consultation / follow-up / telemedicine etc.)
    private com.doc_app.booking.model.AppointmentType appointmentType;

    @Size(max = 1000)
    private String notes;
}