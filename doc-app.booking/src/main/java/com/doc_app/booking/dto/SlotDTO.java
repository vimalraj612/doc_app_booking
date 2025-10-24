package com.doc_app.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SlotDTO {
    private Long slotId;
    private LocalDateTime start;
    private LocalDateTime end;
    private boolean available;
    private String status; // "AVAILABLE" or "BOOKED"

    public SlotDTO(Long slotId, LocalDateTime start, LocalDateTime end, boolean available) {
        this.slotId = slotId;
        this.start = start;
        this.end = end;
        this.available = available;
        this.status = available ? "AVAILABLE" : "BOOKED";
    }

    public SlotDTO(Long slotId, LocalDateTime start, LocalDateTime end, boolean available, String status) {
        this.slotId = slotId;
        this.start = start;
        this.end = end;
        this.available = available;
        this.status = status;
    }

    // convenience constructor for when slotId unknown
    public SlotDTO(LocalDateTime start, LocalDateTime end, boolean available) {
        this(null, start, end, available);
    }

}
