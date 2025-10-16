package com.doc_app.booking.dto;

import com.doc_app.booking.model.NotificationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long appointmentId;
    private NotificationType type;
    private String recipient;
    private String content;
    private boolean sent;
    private LocalDateTime scheduledFor;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}
