package com.doc_app.booking.service.scheduler;

import com.doc_app.booking.config.SlotsGeneratorProperties;
import com.doc_app.booking.dto.SlotDTO;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.DoctorLeaveRepository;
import com.doc_app.booking.repository.SlotTemplateRepository;
import com.doc_app.booking.service.SlotService;
import com.doc_app.booking.service.DistributedLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DailySlotGenerator {

    private final DoctorRepository doctorRepository;
    private final SlotService slotService;
    private final SlotsGeneratorProperties properties;
    private final DoctorLeaveRepository leaveRepository;
    private final SlotTemplateRepository scheduleRepository;
    private final DistributedLockService distributedLockService;

    // Runs based on configurable cron (default: daily 02:00)
    @Scheduled(cron = "${slots.generator.cron}")
    public void generateDaily() {
        String lockName = "daily_slot_generation";
        Duration lockDuration = Duration.ofHours(2); // 2 hours to complete slot generation for all doctors
        
        distributedLockService.executeWithLock(lockName, lockDuration, () -> {
            int days = properties.getDaysAhead();
            log.info("DailySlotGenerator: Starting slot generation for next {} days", days);
            
            List<Doctor> doctors = doctorRepository.findAll();
            LocalDate start = LocalDate.now();
            
            int totalSlotsGenerated = 0;
            int doctorsProcessed = 0;
            
            for (Doctor doc : doctors) {
                for (int i = 0; i < days; i++) {
                    LocalDate date = start.plusDays(i);
                    try {
                        // Skip if doctor has an active leave for this date
                        if (leaveRepository.existsByDoctorAndDate(doc, date)) {
                            log.info("Skipping slot generation for doctor {} on {} because of leave", doc.getId(), date);
                            continue;
                        }

                        // Check schedules for the day (could be multiple ranges); if none active, skip
                        var schedules = scheduleRepository.findByDoctorAndDayOfWeek(doc, date.getDayOfWeek());
                        boolean anyActive = schedules.stream().anyMatch(s -> s.isActive());
                        if (schedules.isEmpty() || !anyActive) {
                            log.debug("No active schedules for doctor {} on {} — skipping", doc.getId(),
                                    date.getDayOfWeek());
                            continue;
                        }

                        List<SlotDTO> slots = slotService.generateSlotsForDoctor(doc.getId(), date);
                        totalSlotsGenerated += slots.size();
                        log.debug("Generated {} slots for doctor {} on {}", slots.size(), doc.getId(), date);
                    } catch (Exception e) {
                        log.error("Failed to generate slots for doctor {} on {}: {}", doc.getId(), date, e.getMessage(), e);
                    }
                }
                doctorsProcessed++;
            }
            
            log.info("DailySlotGenerator: Completed slot generation. Processed {} doctors, generated {} total slots", 
                doctorsProcessed, totalSlotsGenerated);
        });
    }

    @Async
    public void generateDailyAsync() {
        log.info("DailySlotGenerator: Starting async slot generation...");
        generateDaily();
    }
}
