package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.service.CommonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommonServiceImpl implements CommonService {

    private final DoctorRepository doctorRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDTO> searchDoctors(String name, String specialization, String hospitalName) {
        List<Doctor> doctors = doctorRepository.searchByNameSpecializationHospital(name, specialization, hospitalName);
        return doctors.stream().map(mapper::toDoctorDTO).collect(Collectors.toList());
    }
}
