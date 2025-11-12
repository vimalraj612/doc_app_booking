package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.model.AppointmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateAppointmentRequest {
    @FutureOrPresent(message = "{" + MessageKeys.APPOINTMENT_DATE_TIME_FUTURE + "}")
    private LocalDateTime appointmentDateTime;

    private AppointmentStatus status;

    @Size(max = 500, message = "{" + MessageKeys.REASON_SIZE + "}")
    private String reason;

    @Size(max = 1000, message = "{" + MessageKeys.NOTES_SIZE + "}")
    private String notes;

    private LocalDateTime followUpDate;

    private com.doc_app.booking.model.AppointmentType appointmentType;
}