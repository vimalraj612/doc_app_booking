package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateDoctorRequest;
import com.doc_app.booking.dto.request.UpdateDoctorRequest;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Hospital;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.HospitalRepository;
import com.doc_app.booking.service.DoctorService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final EntityMapper mapper;

    @Override
    public DoctorDTO createDoctor(CreateDoctorRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Doctor with email " + request.getEmail() + " already exists");
        }

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Hospital not found with id: " + request.getHospitalId()));

        Doctor doctor = mapper.toDoctor(request);
        doctor.setHospital(hospital);
        doctor = doctorRepository.save(doctor);
        return mapper.toDoctorDTO(doctor);
    }

    @Override
    public DoctorDTO updateDoctor(Long id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));

        if (request.getHospitalId() != null && !request.getHospitalId().equals(doctor.getHospital().getId())) {
            Hospital newHospital = hospitalRepository.findById(request.getHospitalId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Hospital not found with id: " + request.getHospitalId()));
            doctor.setHospital(newHospital);
        }

        mapper.updateDoctor(doctor, request);
        doctor = doctorRepository.save(doctor);
        return mapper.toDoctorDTO(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
        return mapper.toDoctorDTO(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorDTO> getAllDoctors(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Doctor> doctors = doctorRepository.findAll(pageable);

        List<DoctorDTO> content = doctors.getContent().stream()
                .map(mapper::toDoctorDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                doctors.getNumber(),
                doctors.getSize(),
                doctors.getTotalElements(),
                doctors.getTotalPages(),
                doctors.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorDTO> getAllDoctors(
            int pageNo,
            int pageSize,
            String sortBy,
            String sortDir,
            String name,
            String specialization,
            String department,
            Long hospitalId,
            Integer minExperience,
            Integer maxExperience,
            String email,
            String phoneNumber
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        // Call repository method for filtered search
        Page<Doctor> doctors = doctorRepository.findWithFilters(
                name,
                specialization,
                department,
                hospitalId,
                minExperience,
                maxExperience,
                email,
                phoneNumber,
                pageable
        );

        List<DoctorDTO> content = doctors.getContent().stream()
                .map(mapper::toDoctorDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                doctors.getNumber(),
                doctors.getSize(),
                doctors.getTotalElements(),
                doctors.getTotalPages(),
                doctors.isLast());
    }

    @Override
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDTO> getDoctorsByHospital(Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId).stream()
                .map(mapper::toDoctorDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization).stream()
                .map(mapper::toDoctorDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorByEmail(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with email: " + email));
        return mapper.toDoctorDTO(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorByContact(String contact) {
        Doctor doctor = doctorRepository.findByContact(contact)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with contact: " + contact));
        return mapper.toDoctorDTO(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDTO> searchDoctors(String name, String specialization, Long hospitalId) {
        List<Doctor> doctors = doctorRepository.search(
                name != null && !name.isBlank() ? name : null,
                specialization != null && !specialization.isBlank() ? specialization : null,
                hospitalId);

        return doctors.stream().map(mapper::toDoctorDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getDoctorCount(
            String name,
            String specialization,
            String department,
            Long hospitalId,
            Integer minExperience,
            Integer maxExperience,
            String email,
            String phoneNumber
    ) {
        return doctorRepository.countWithFilters(
                name,
                specialization,
                department,
                hospitalId,
                minExperience,
                maxExperience,
                email,
                phoneNumber
        );
    }
}