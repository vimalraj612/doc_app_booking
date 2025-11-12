package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateNotificationRequest {
    @Size(max = 2000, message = "{" + MessageKeys.CONTENT_SIZE + "}")
    private String content;

    @FutureOrPresent(message = "{" + MessageKeys.SCHEDULED_FOR_FUTURE + "}")
    private LocalDateTime scheduledFor;
}