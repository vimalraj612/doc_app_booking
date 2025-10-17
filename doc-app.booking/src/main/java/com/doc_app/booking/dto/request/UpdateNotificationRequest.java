package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateNotificationRequest {
    @Size(max = 2000)
    private String content;

    @FutureOrPresent
    private LocalDateTime scheduledFor;
}