package com.doc_app.booking.dto.request;

import com.doc_app.booking.model.AppointmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateAppointmentRequest {
    @FutureOrPresent
    private LocalDateTime appointmentDateTime;

    private AppointmentStatus status;

    @Size(max = 500)
    private String reason;

    @Size(max = 1000)
    private String notes;

    private com.doc_app.booking.model.AppointmentType appointmentType;
}