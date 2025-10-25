//

package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.HospitalDTO;
import com.doc_app.booking.dto.request.CreateHospitalRequest;
import com.doc_app.booking.dto.request.UpdateHospitalRequest;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Hospital;
import com.doc_app.booking.repository.HospitalRepository;
import com.doc_app.booking.service.HospitalService;
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
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;
    private final EntityMapper mapper;

    @Override
    public HospitalDTO createHospital(CreateHospitalRequest request) {
        if (hospitalRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Hospital with email " + request.getEmail() + " already exists");
        }
        Hospital hospital = mapper.toHospital(request);
        hospital = hospitalRepository.save(hospital);
        return mapper.toHospitalDTO(hospital);
    }

    @Override
    public HospitalDTO updateHospital(Long id, UpdateHospitalRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found with id: " + id));

        mapper.updateHospital(hospital, request);
        hospital = hospitalRepository.save(hospital);
        return mapper.toHospitalDTO(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalDTO getHospitalById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found with id: " + id));
        return mapper.toHospitalDTO(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HospitalDTO> getAllHospitals(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Hospital> hospitals = hospitalRepository.findAll(pageable);

        List<HospitalDTO> content = hospitals.getContent().stream()
                .map(mapper::toHospitalDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                hospitals.getNumber(),
                hospitals.getSize(),
                hospitals.getTotalElements(),
                hospitals.getTotalPages(),
                hospitals.isLast());
    }

    @Override
    public void deleteHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found with id: " + id));
        hospitalRepository.delete(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalDTO getHospitalByEmail(String email) {
        Hospital hospital = hospitalRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found with email: " + email));
        return mapper.toHospitalDTO(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public HospitalDTO getHospitalByPhoneNumber(String phoneNumber) {
        Hospital hospital = hospitalRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found with phone number: " + phoneNumber));
        return mapper.toHospitalDTO(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HospitalDTO> searchHospitals(String keyword) {
        // This is a simplified search. In a real application, you might want to use
        // full-text search capabilities of your database or search engines like
        // Elasticsearch
        return hospitalRepository.findAll().stream()
                .filter(hospital -> hospital.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                        hospital.getAddress().toLowerCase().contains(keyword.toLowerCase()))
                .map(mapper::toHospitalDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getHospitalCount() {
        return hospitalRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByPhoneNumber(String phoneNumber) {
        return hospitalRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public com.doc_app.booking.dto.UserInfoDTO findUserInfoByPhoneNumber(String phoneNumber) {
        return hospitalRepository.findByPhoneNumber(phoneNumber)
                .map(h -> new com.doc_app.booking.dto.UserInfoDTO(
                        h.getId(),
                        "HOSPITAL_ADMIN",
                        h.getName() != null ? h.getName() : ""
                ))
                .orElse(null);
    }
}