package com.doc_app.booking.repository;

import com.doc_app.booking.model.Notification;
import com.doc_app.booking.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAppointmentId(Long appointmentId);

    List<Notification> findByType(NotificationType type);

    List<Notification> findBySentAndScheduledForBefore(boolean sent, LocalDateTime dateTime);

    List<Notification> findByRecipient(String recipient);
}