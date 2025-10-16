package com.doc_app.booking.dto.request;

import com.doc_app.booking.model.NotificationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateNotificationRequest {
    private Long appointmentId;
    private NotificationType type;
    private String recipient;
    private String content;
    private LocalDateTime scheduledFor;
}