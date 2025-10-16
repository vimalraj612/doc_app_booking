package com.doc_app.booking.dto.request;

import com.doc_app.booking.model.AppointmentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateAppointmentRequest {
    private LocalDateTime appointmentDateTime;
    private AppointmentStatus status;
    private String reason;
    private String notes;
}