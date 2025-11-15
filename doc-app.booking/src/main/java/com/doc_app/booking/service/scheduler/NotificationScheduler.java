package com.doc_app.booking.service.scheduler;

import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.AppointmentStatus;
import com.doc_app.booking.repository.AppointmentRepository;
import com.doc_app.booking.service.EmailService;
import com.doc_app.booking.service.DistributedLockService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final DistributedLockService distributedLockService;

    @Scheduled(cron = "0 0 8 * * ?") // Run at 8:00 AM every day
    @Transactional(readOnly = true)
    public void sendDailyAppointmentReminders() {
        String lockName = "daily_appointment_reminders";
        Duration lockDuration = Duration.ofMinutes(30); // 30 minutes to complete the task
        
        distributedLockService.executeWithLock(lockName, lockDuration, () -> {
            log.info("Starting daily appointment reminders execution...");
            
            LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0);
            LocalDateTime dayAfterTomorrow = tomorrow.plusDays(1);

            List<Appointment> appointments = appointmentRepository.findByAppointmentDateTimeBetweenAndStatus(
                    tomorrow, dayAfterTomorrow, AppointmentStatus.SCHEDULED);

            log.info("Found {} appointments for daily reminders", appointments.size());

            for (Appointment appointment : appointments) {
                try {
                    emailService.sendAppointmentReminder(appointment);
                    log.info("Sent daily appointment reminder for appointment ID: {}", appointment.getId());
                } catch (Exception e) {
                    log.error("Failed to send daily reminder for appointment ID: {}", appointment.getId(), e);
                }
            }
            
            log.info("Completed daily appointment reminders execution");
        });
    }

    @Scheduled(cron = "0 0 7 * * ?") // Run at 7:00 AM every day
    @Transactional(readOnly = true)
    public void sendUpcomingAppointmentReminders() {
        String lockName = "upcoming_appointment_reminders";
        Duration lockDuration = Duration.ofMinutes(30); // 30 minutes to complete the task
        
        distributedLockService.executeWithLock(lockName, lockDuration, () -> {
            log.info("Starting upcoming appointment reminders execution (3-day advance)...");
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime threeDaysFromNow = now.plusDays(3).withHour(0).withMinute(0);
            LocalDateTime fourDaysFromNow = threeDaysFromNow.plusDays(1);

            List<Appointment> appointments = appointmentRepository.findByAppointmentDateTimeBetweenAndStatus(
                    threeDaysFromNow, fourDaysFromNow, AppointmentStatus.SCHEDULED);

            log.info("Found {} appointments for 3-day advance reminders", appointments.size());

            for (Appointment appointment : appointments) {
                try {
                    emailService.sendAppointmentReminder(appointment);
                    log.info("Sent 3-day reminder for appointment ID: {}", appointment.getId());
                } catch (Exception e) {
                    log.error("Failed to send 3-day reminder for appointment ID: {}", appointment.getId(), e);
                }
            }
            
            log.info("Completed upcoming appointment reminders execution");
        });
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void cleanupExpiredLocks() {
        try {
            distributedLockService.cleanupExpiredLocks();
        } catch (Exception e) {
            log.error("Error during scheduled lock cleanup", e);
        }
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional(readOnly = true)
    public void sendImmediateNotifications() {
        // Note: Immediate notifications like cancellations don't need distributed locks
        // as they are triggered by user actions, not scheduled tasks
        
        // Add logic for immediate notifications if needed
        // For example: checking for last-minute appointment changes
    }
}