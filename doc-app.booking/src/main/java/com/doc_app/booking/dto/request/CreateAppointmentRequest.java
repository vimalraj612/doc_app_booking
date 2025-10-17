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

    @NotNull
    @Positive
    private Long patientId;

    @NotNull
    @FutureOrPresent
    private LocalDateTime appointmentDateTime;

    // optional: if provided, book this slot
    @Positive
    private Long slotId;

    @Size(max = 500)
    private String reason;

    @Size(max = 1000)
    private String notes;
}