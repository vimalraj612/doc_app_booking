package com.doc_app.booking.dto;

import com.doc_app.booking.model.AppointmentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentDTO {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private LocalDateTime appointmentDateTime;
    private AppointmentStatus status;
    private com.doc_app.booking.model.AppointmentType appointmentType;
    private String reason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
