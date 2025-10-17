package com.doc_app.booking.service.scheduler;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.AppointmentStatus;
import com.doc_app.booking.repository.AppointmentRepository;
import com.doc_app.booking.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 8 * * ?") // Run at 8:00 AM every day
    @Transactional(readOnly = true)
    public void sendDailyAppointmentReminders() {
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0);
        LocalDateTime dayAfterTomorrow = tomorrow.plusDays(1);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateTimeBetweenAndStatus(
                tomorrow, dayAfterTomorrow, AppointmentStatus.CONFIRMED);

        for (Appointment appointment : appointments) {
            try {
                emailService.sendAppointmentReminder(appointment);
                log.info("Sent appointment reminder for appointment ID: {}", appointment.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment ID: {}", appointment.getId(), e);
            }
        }
    }

    @Scheduled(cron = "0 0 7 * * ?") // Run at 7:00 AM every day
    @Transactional(readOnly = true)
    public void sendUpcomingAppointmentReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysFromNow = now.plusDays(3).withHour(0).withMinute(0);
        LocalDateTime fourDaysFromNow = threeDaysFromNow.plusDays(1);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateTimeBetweenAndStatus(
                threeDaysFromNow, fourDaysFromNow, AppointmentStatus.CONFIRMED);

        for (Appointment appointment : appointments) {
            try {
                emailService.sendAppointmentReminder(appointment);
                log.info("Sent 3-day reminder for appointment ID: {}", appointment.getId());
            } catch (Exception e) {
                log.error("Failed to send 3-day reminder for appointment ID: {}", appointment.getId(), e);
            }
        }
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional(readOnly = true)
    public void sendImmediateNotifications() {
        // Add logic for immediate notifications, such as cancellations or urgent
        // updates
    }
}