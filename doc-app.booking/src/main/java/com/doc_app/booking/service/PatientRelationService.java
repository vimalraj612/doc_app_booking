package com.doc_app.booking.service;

import com.doc_app.booking.dto.PatientRelationDTO;
import com.doc_app.booking.dto.request.CreatePatientRelationRequest;
import com.doc_app.booking.dto.request.UpdatePatientRelationRequest;

import java.util.List;

public interface PatientRelationService {
    PatientRelationDTO create(Long patientId, CreatePatientRelationRequest request);
    PatientRelationDTO update(Long id, UpdatePatientRelationRequest request);
    PatientRelationDTO getById(Long id);
    List<PatientRelationDTO> getByPatientId(Long patientId);
    void delete(Long id);
}
