package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.PatientDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreatePatientRequest;
import com.doc_app.booking.dto.request.UpdatePatientRequest;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.repository.PatientRepository;
import com.doc_app.booking.service.PatientService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final EntityMapper mapper;

    @Override
    public PatientDTO createPatient(CreatePatientRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Patient with email " + request.getEmail() + " already exists");
        }

        Patient patient = mapper.toPatient(request);
        patient = patientRepository.save(patient);
        return mapper.toPatientDTO(patient);
    }

    @Override
    public PatientDTO updatePatient(Long id, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));

        mapper.updatePatient(patient, request);
        patient = patientRepository.save(patient);
        return mapper.toPatientDTO(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
        return mapper.toPatientDTO(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PatientDTO> getAllPatients(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Patient> patients = patientRepository.findAll(pageable);

        return new PageResponse<>(
            patients.getContent().stream().map(mapper::toPatientDTO).toList(),
            patients.getNumber(),
            patients.getSize(),
            patients.getTotalElements(),
            patients.getTotalPages(),
            patients.isLast()
        );
    }

    @Override
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
        patientRepository.delete(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getPatientByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with email: " + email));
        return mapper.toPatientDTO(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getPatientByPhoneNumber(String phoneNumber) {
        Patient patient = patientRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with phone number: " + phoneNumber));
        return mapper.toPatientDTO(patient);
    }
}