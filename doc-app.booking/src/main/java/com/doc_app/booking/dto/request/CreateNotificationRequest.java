package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.model.NotificationType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateNotificationRequest {
    @NotNull(message = "{" + MessageKeys.APPOINTMENT_ID_REQUIRED + "}")
    private Long appointmentId;

    @NotNull(message = "{" + MessageKeys.NOTIFICATION_TYPE_REQUIRED + "}")
    private NotificationType type;

    @NotNull(message = "{" + MessageKeys.RECIPIENT_REQUIRED + "}")
    @Size(max = 200, message = "{" + MessageKeys.RECIPIENT_SIZE + "}")
    private String recipient;

    @Size(max = 2000, message = "{" + MessageKeys.CONTENT_SIZE + "}")
    private String content;

    @FutureOrPresent(message = "{" + MessageKeys.SCHEDULED_FOR_FUTURE + "}")
    private LocalDateTime scheduledFor;
}