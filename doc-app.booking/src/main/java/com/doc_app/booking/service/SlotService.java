package com.doc_app.booking.service;

import com.doc_app.booking.dto.SlotDTO;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    /**
     * Count free slots for a doctor for today
     */
    long countFreeSlotsToday(Long doctorId);

    List<SlotDTO> generateSlotsForDoctor(Long doctorId, LocalDate date);

    List<SlotDTO> getAvailableSlots(Long doctorId, LocalDate date);

    List<SlotDTO> getAllSlots(Long doctorId);
}
