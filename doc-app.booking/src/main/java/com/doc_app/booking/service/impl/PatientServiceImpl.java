package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.PatientDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreatePatientRequest;
import com.doc_app.booking.dto.request.UpdatePatientRequest;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.repository.DoctorRepository;
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
    private final DoctorRepository doctorRepository;
    private final EntityMapper mapper;

    @Override
    public PatientDTO createPatient(CreatePatientRequest request) {
        if (patientRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException(
                    "Patient with phone number " + request.getPhoneNumber() + " already exists");
        }
        Patient patient = new Patient();
        patient.setPhoneNumber(request.getPhoneNumber());
        // All other fields are optional, set if present
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setLatitude(request.getLatitude());
        patient.setLongitude(request.getLongitude());
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
                patients.isLast());
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
    public PatientDTO getPatientByPhoneNumber(String phoneNumber) {
        return patientRepository.findByPhoneNumber(phoneNumber)
            .map(mapper::toPatientDTO)
            .orElseGet(() -> {
                // Auto signup with phoneNumber only
                Patient newPatient = new Patient();
                newPatient.setPhoneNumber(phoneNumber);
                Patient saved = patientRepository.save(newPatient);
                return mapper.toPatientDTO(saved);
            });
    }

    @Override
    public void updateLastVisitedDoctor(Long patientId, Long doctorId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + doctorId));

        patient.setLastVisitedDoctor(doctor);
        patientRepository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO getPatientWithLastVisitedDoctor(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));
        return mapper.toPatientDTO(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByPhoneNumber(String phoneNumber) {
        return patientRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public com.doc_app.booking.dto.UserInfoDTO findUserInfoByPhoneNumber(String phoneNumber) {
        return patientRepository.findByPhoneNumber(phoneNumber)
                .map(p -> new com.doc_app.booking.dto.UserInfoDTO(
                        p.getId(),
                        "PATIENT",
                        (p.getFirstName() != null && p.getLastName() != null) ? p.getFirstName() + " " + p.getLastName()
                                : (p.getFirstName() != null ? p.getFirstName()
                                        : (p.getLastName() != null ? p.getLastName() : ""))))
                .orElse(null);
    }
}