package com.doc_app.booking.controller;

import com.doc_app.booking.dto.NotificationDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateNotificationRequest;
import com.doc_app.booking.dto.request.UpdateNotificationRequest;
import com.doc_app.booking.model.NotificationType;
import com.doc_app.booking.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationDTO>> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        NotificationDTO notificationDTO = notificationService.createNotification(request);
        return new ResponseEntity<>(ApiResponse.success("Notification created successfully", notificationDTO),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationDTO>> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNotificationRequest request) {
        NotificationDTO notificationDTO = notificationService.updateNotification(id, request);
        return ResponseEntity.ok(ApiResponse.success("Notification updated successfully", notificationDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationDTO>> getNotification(@PathVariable Long id) {
        NotificationDTO notificationDTO = notificationService.getNotificationById(id);
        return ResponseEntity.ok(ApiResponse.success(notificationDTO));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<NotificationDTO> response = notificationService.getAllNotifications(pageNo, pageSize, sortBy,
                sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotificationsByAppointment(
            @PathVariable Long appointmentId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotificationsByType(
            @PathVariable NotificationType type) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByType(type);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getPendingNotifications() {
        List<NotificationDTO> notifications = notificationService.getPendingNotifications();
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/recipient/{recipient}")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotificationsByRecipient(
            @PathVariable String recipient) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByRecipient(recipient);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<Void>> sendNotification(@PathVariable Long id) {
        notificationService.sendNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification sent successfully", null));
    }

    @PostMapping("/send-all-pending")
    public ResponseEntity<ApiResponse<Void>> sendAllPendingNotifications() {
        notificationService.sendAllPendingNotifications();
        return ResponseEntity.ok(ApiResponse.success("All pending notifications sent successfully", null));
    }
}