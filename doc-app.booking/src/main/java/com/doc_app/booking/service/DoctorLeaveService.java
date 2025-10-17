package com.doc_app.booking.service;

import com.doc_app.booking.model.DoctorLeave;

import java.time.LocalDate;
import java.util.List;

public interface DoctorLeaveService {
    DoctorLeave createLeave(Long doctorId, LocalDate date, String reason);

    void deleteLeave(Long id);

    List<DoctorLeave> getLeavesForDoctor(Long doctorId);
}
