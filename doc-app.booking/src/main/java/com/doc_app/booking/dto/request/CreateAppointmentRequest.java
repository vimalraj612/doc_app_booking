package com.doc_app.booking.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateAppointmentRequest {
    private Long doctorId;
    private Long patientId;
    private LocalDateTime appointmentDateTime;
    private String reason;
    private String notes;
}