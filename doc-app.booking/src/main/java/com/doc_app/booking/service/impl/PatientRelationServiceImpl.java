package com.doc_app.booking.service.impl;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.dto.PatientRelationDTO;
import com.doc_app.booking.dto.request.CreatePatientRelationRequest;
import com.doc_app.booking.dto.request.UpdatePatientRelationRequest;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.model.PatientRelation;
import com.doc_app.booking.repository.PatientRelationRepository;
import com.doc_app.booking.repository.PatientRepository;
import com.doc_app.booking.service.PatientRelationService;
import com.doc_app.booking.util.LocaleManager;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientRelationServiceImpl implements PatientRelationService {

    private final PatientRelationRepository relationRepository;
    private final PatientRepository patientRepository;
    private final LocaleManager localeManager;

    public PatientRelationServiceImpl(PatientRelationRepository relationRepository,
                                      PatientRepository patientRepository,
                                      LocaleManager localeManager) {
        this.relationRepository = relationRepository;
        this.patientRepository = patientRepository;
        this.localeManager = localeManager;
    }

    @Override
    @Transactional
    public PatientRelationDTO create(Long patientId, CreatePatientRelationRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException(localeManager.getMessage(MessageKeys.PATIENT_NOT_FOUND_ID, patientId)));

        PatientRelation relation = new PatientRelation();
        relation.setPatient(patient);
        relation.setFullName(request.getFullName());
        relation.setAge(request.getAge());
        relation.setPhoneNumber(request.getPhoneNumber());
        relation.setGender(request.getGender());
        relation.setRelationship(request.getRelationship());

        relation = relationRepository.save(relation);
        return toDto(relation);
    }

    @Override
    @Transactional
    public PatientRelationDTO update(Long id, UpdatePatientRelationRequest request) {
        PatientRelation relation = relationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(localeManager.getMessage(MessageKeys.NOTIFICATION_NOT_FOUND_ID, id)));

        if (request.getFullName() != null) relation.setFullName(request.getFullName());
        if (request.getAge() != null) relation.setAge(request.getAge());
        if (request.getPhoneNumber() != null) relation.setPhoneNumber(request.getPhoneNumber());
        if (request.getGender() != null) relation.setGender(request.getGender());
        if (request.getRelationship() != null) relation.setRelationship(request.getRelationship());

        relation = relationRepository.save(relation);
        return toDto(relation);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientRelationDTO getById(Long id) {
        return relationRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException(localeManager.getMessage(MessageKeys.NOTIFICATION_NOT_FOUND_ID, id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientRelationDTO> getByPatientId(Long patientId) {
        return relationRepository.findByPatientId(patientId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        relationRepository.deleteById(id);
    }

    private PatientRelationDTO toDto(PatientRelation relation) {
        PatientRelationDTO dto = new PatientRelationDTO();
        dto.setId(relation.getId());
        dto.setPatientId(relation.getPatient() != null ? relation.getPatient().getId() : null);
        dto.setFullName(relation.getFullName());
        dto.setAge(relation.getAge());
        dto.setPhoneNumber(relation.getPhoneNumber());
        dto.setGender(relation.getGender());
        dto.setRelationship(relation.getRelationship());
        return dto;
    }
}
