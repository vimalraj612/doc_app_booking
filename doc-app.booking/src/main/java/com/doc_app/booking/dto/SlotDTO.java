package com.doc_app.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.doc_app.booking.model.AppointmentStatus;

@Data
public class SlotDTO {
    private Long slotId;
    private LocalDateTime start;
    private LocalDateTime end;
    private boolean available;
    private String status; // "AVAILABLE" or "BOOKED"
    private AppointmentStatus appointmentStatus;

    public SlotDTO(Long slotId, LocalDateTime start, LocalDateTime end, boolean available) {
        this(slotId, start, end, available, null, null);
    }

    public SlotDTO(Long slotId, LocalDateTime start, LocalDateTime end, boolean available, String status) {
        this(slotId, start, end, available, status, null);
    }

    public SlotDTO(Long slotId, LocalDateTime start, LocalDateTime end, boolean available, String status,
            AppointmentStatus appointmentStatus) {
        this.slotId = slotId;
        this.start = start;
        this.end = end;
        this.available = available;
        this.status = status;
        this.appointmentStatus = appointmentStatus;
    }

    // convenience constructor for when slotId unknown
    public SlotDTO(LocalDateTime start, LocalDateTime end, boolean available) {
        this(null, start, end, available, null, null);
    }

}
