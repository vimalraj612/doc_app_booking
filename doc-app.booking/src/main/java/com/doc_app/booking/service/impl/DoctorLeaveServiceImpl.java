package com.doc_app.booking.service.impl;

import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.DoctorLeave;
import com.doc_app.booking.repository.DoctorLeaveRepository;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.service.DoctorLeaveService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorLeaveServiceImpl implements DoctorLeaveService {

    private final DoctorLeaveRepository leaveRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public DoctorLeave createLeave(Long doctorId, LocalDate date, String reason) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        DoctorLeave leave = new DoctorLeave();
        leave.setDoctor(doc);
        leave.setDate(date);
        leave.setReason(reason);
        leave.setActive(true);
        return leaveRepository.save(leave);
    }

    @Override
    public void deleteLeave(Long id) {
        var l = leaveRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Leave not found"));
        leaveRepository.delete(l);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorLeave> getLeavesForDoctor(Long doctorId) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        return leaveRepository.findByDoctorAndDateBetween(doc, LocalDate.now().minusYears(1),
                LocalDate.now().plusYears(1));
    }
}
