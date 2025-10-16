package com.doc_app.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TimeSlotDTO {
    private LocalDateTime start;
    private LocalDateTime end;
    private boolean available;
}
