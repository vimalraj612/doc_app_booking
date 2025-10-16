package com.doc_app.booking.dto.request;

import com.doc_app.booking.model.AppointmentStatus;
import lombok.Data;

@Data
public class AppointmentStatusUpdateRequest {
    private AppointmentStatus status;
    private String notes;
}