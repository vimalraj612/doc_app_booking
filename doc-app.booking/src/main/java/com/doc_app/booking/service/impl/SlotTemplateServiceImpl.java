package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.SlotTemplateDTO;
import com.doc_app.booking.dto.request.SlotTemplateRequestDTO;
import com.doc_app.booking.exception.BusinessException;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.SlotTemplate;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.SlotTemplateRepository;
import com.doc_app.booking.service.SlotTemplateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotTemplateServiceImpl implements SlotTemplateService {

    private final SlotTemplateRepository slotTemplateRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional
    public SlotTemplateRequestDTO createOrUpdateSlotTemplate(SlotTemplateRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        SlotTemplate slotTemplate;
        if (dto.getId() != null) {
            slotTemplate = slotTemplateRepository.findById(dto.getId())
                    .orElse(new SlotTemplate());
        } else {
            slotTemplate = new SlotTemplate();
        }

        // validation
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            log.warn("Invalid slot template request: missing start/end time for doctor {}", dto.getDoctorId());
            throw new BusinessException("Start and end time must be provided");
        }
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            log.warn("Invalid slot template request: start >= end for doctor {}", dto.getDoctorId());
            throw new BusinessException("Start time must be before end time");
        }
        if (dto.getSlotDurationMinutes() == null || dto.getSlotDurationMinutes() <= 0) {
            log.warn("Invalid slot template request: non-positive slot duration for doctor {}", dto.getDoctorId());
            throw new BusinessException("Slot duration must be positive");
        }

        // ensure slot fits at least once
        long minutes = java.time.Duration.between(dto.getStartTime(), dto.getEndTime()).toMinutes();
        if (minutes < dto.getSlotDurationMinutes()) {
            log.warn("Slot duration {} is larger than slot template window {} minutes for doctor {}",
                    dto.getSlotDurationMinutes(), minutes, dto.getDoctorId());
            throw new BusinessException("Slot duration is larger than the slot template window");
        }

        // check overlapping slot templates for same doctor and dayOfWeek
        List<SlotTemplate> existing = slotTemplateRepository.findByDoctor(doctor);
        for (SlotTemplate ex : existing) {
            if (ex.getId() != null && dto.getId() != null && ex.getId().equals(dto.getId()))
                continue; // skip self
            if (!ex.getDayOfWeek().equals(dto.getDayOfWeek()))
                continue;

            // overlap if start < ex.end && ex.start < end
            if (dto.getStartTime().isBefore(ex.getEndTime()) && ex.getStartTime().isBefore(dto.getEndTime())) {
                log.warn(
                        "Overlap detected when creating slot template for doctor {}: {}-{} overlaps with existing {}-{}",
                        dto.getDoctorId(), dto.getStartTime(), dto.getEndTime(), ex.getStartTime(), ex.getEndTime());
                throw new BusinessException(
                        "Provided slot template overlaps with an existing slot template for this doctor on the same day");
            }
        }

        slotTemplate.setDoctor(doctor);
        slotTemplate.setDayOfWeek(dto.getDayOfWeek());
        slotTemplate.setStartTime(dto.getStartTime());
        slotTemplate.setEndTime(dto.getEndTime());
        slotTemplate.setSlotDurationMinutes(dto.getSlotDurationMinutes());
        slotTemplate.setActive(dto.isActive());

        slotTemplate = slotTemplateRepository.save(slotTemplate);

        dto.setId(slotTemplate.getId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotTemplateDTO> getSlotTemplateByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        return slotTemplateRepository.findByDoctor(doctor).stream().map(s -> {
            SlotTemplateDTO dto = new SlotTemplateDTO();
            dto.setId(s.getId());
            dto.setDoctorId(doctorId);
            dto.setDayOfWeek(s.getDayOfWeek());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setSlotDurationMinutes(s.getSlotDurationMinutes());
            dto.setActive(s.isActive());
            return dto;
        }).collect(Collectors.toList());
    }
}
