package com.doc_app.booking.dto.request;

import com.doc_app.booking.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AppointmentStatusUpdateRequest {
    @NotNull
    private AppointmentStatus status;

    @Size(max = 1000)
    private String notes;
}