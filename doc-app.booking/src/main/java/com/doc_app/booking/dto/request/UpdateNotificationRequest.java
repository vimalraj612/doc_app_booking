package com.doc_app.booking.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateNotificationRequest {
    private String content;
    private LocalDateTime scheduledFor;
}