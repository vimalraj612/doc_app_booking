package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.NotificationDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateNotificationRequest;
import com.doc_app.booking.dto.request.UpdateNotificationRequest;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Notification;
import com.doc_app.booking.model.NotificationType;
import com.doc_app.booking.repository.AppointmentRepository;
import com.doc_app.booking.repository.NotificationRepository;
import com.doc_app.booking.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppointmentRepository appointmentRepository;
    private final EntityMapper mapper;
    private final JavaMailSender emailSender;

    @Override
    public NotificationDTO createNotification(CreateNotificationRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with id: " + request.getAppointmentId()));

        Notification notification = mapper.toNotification(request);
        notification.setAppointment(appointment);
        notification = notificationRepository.save(notification);
        return mapper.toNotificationDTO(notification);
    }

    @Override
    public NotificationDTO updateNotification(Long id, UpdateNotificationRequest request) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + id));

        mapper.updateNotification(notification, request);
        notification = notificationRepository.save(notification);
        return mapper.toNotificationDTO(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + id));
        return mapper.toNotificationDTO(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationDTO> getAllNotifications(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Notification> notifications = notificationRepository.findAll(pageable);

        List<NotificationDTO> content = notifications.getContent().stream()
                .map(mapper::toNotificationDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements(),
                notifications.getTotalPages(),
                notifications.isLast());
    }

    @Override
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + id));
        notificationRepository.delete(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByAppointment(Long appointmentId) {
        return notificationRepository.findByAppointmentId(appointmentId).stream()
                .map(mapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByType(NotificationType type) {
        return notificationRepository.findByType(type).stream()
                .map(mapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getPendingNotifications() {
        return notificationRepository.findBySentAndScheduledForBefore(false, LocalDateTime.now()).stream()
                .map(mapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByRecipient(String recipient) {
        return notificationRepository.findByRecipient(recipient).stream()
                .map(mapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void sendNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));

        sendEmail(notification);
        notification.setSent(true);
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void sendAllPendingNotifications() {
        List<Notification> pendingNotifications = notificationRepository
                .findBySentAndScheduledForBefore(false, LocalDateTime.now());

        for (Notification notification : pendingNotifications) {
            try {
                sendEmail(notification);
                notification.setSent(true);
                notification.setSentAt(LocalDateTime.now());
                notificationRepository.save(notification);
            } catch (Exception e) {
                // Log the error but continue with other notifications
                e.printStackTrace();
            }
        }
    }

    private void sendEmail(Notification notification) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(notification.getRecipient());
        message.setSubject("Appointment Notification - " + notification.getType());
        message.setText(notification.getContent());
        emailSender.send(message);
    }
}