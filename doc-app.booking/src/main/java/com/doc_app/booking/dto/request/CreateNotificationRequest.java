package com.doc_app.booking.dto.request;

import com.doc_app.booking.model.NotificationType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateNotificationRequest {
    @NotNull
    private Long appointmentId;

    @NotNull
    private NotificationType type;

    @NotNull
    @Size(max = 200)
    private String recipient;

    @Size(max = 2000)
    private String content;

    @FutureOrPresent
    private LocalDateTime scheduledFor;
}