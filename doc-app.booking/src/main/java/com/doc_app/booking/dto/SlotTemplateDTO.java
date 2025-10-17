package com.doc_app.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class SlotTemplateDTO {
    private Long id;

    @NotNull
    private Long doctorId;

    @NotNull
    private DayOfWeek dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotNull
    @Positive
    @Min(5)
    private Integer slotDurationMinutes;

    private boolean active = true;
}
