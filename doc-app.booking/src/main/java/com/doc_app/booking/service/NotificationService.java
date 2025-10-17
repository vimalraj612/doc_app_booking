package com.doc_app.booking.service;

import com.doc_app.booking.dto.NotificationDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateNotificationRequest;
import com.doc_app.booking.dto.request.UpdateNotificationRequest;
import com.doc_app.booking.model.NotificationType;
import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(CreateNotificationRequest request);

    NotificationDTO updateNotification(Long id, UpdateNotificationRequest request);

    NotificationDTO getNotificationById(Long id);

    PageResponse<NotificationDTO> getAllNotifications(int pageNo, int pageSize, String sortBy, String sortDir);

    void deleteNotification(Long id);

    List<NotificationDTO> getNotificationsByAppointment(Long appointmentId);

    List<NotificationDTO> getNotificationsByType(NotificationType type);

    List<NotificationDTO> getPendingNotifications();

    List<NotificationDTO> getNotificationsByRecipient(String recipient);

    void sendNotification(Long notificationId);

    void sendAllPendingNotifications();
}