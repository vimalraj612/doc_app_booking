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

    // Patient identification by phone number (unique identifier, optional for
    // reserved)
    @Size(min = 10, max = 15, message = "Phone number must be between 10-15 characters")
    private String patientPhone;

    // Optional for reserved appointments
    @Size(min = 2, max = 150, message = "Patient name must be between 2-150 characters")
    private String patientName;

    @NotNull
    @FutureOrPresent
    private LocalDateTime appointmentDateTime;

    private String appointeeName;
    private Integer appointeeAge;
    private String appointeePhone;
    private String appointeeGender;

    // optional: if provided, book this slot
    @Positive
    private Long slotId;

    @Size(max = 1000)
    private String notes;

    private boolean reserved;

    public boolean isReserved() {
        return reserved || (patientPhone == null || patientPhone.isBlank());
    }
}