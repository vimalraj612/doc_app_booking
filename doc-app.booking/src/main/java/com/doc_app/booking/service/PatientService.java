package com.doc_app.booking.service;

import com.doc_app.booking.dto.PatientDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreatePatientRequest;
import com.doc_app.booking.dto.request.UpdatePatientRequest;

public interface PatientService {
    PatientDTO createPatient(CreatePatientRequest request);

    PatientDTO updatePatient(Long id, UpdatePatientRequest request);

    PatientDTO getPatientById(Long id);

    PageResponse<PatientDTO> getAllPatients(int pageNo, int pageSize, String sortBy, String sortDir);

    void deletePatient(Long id);

    PatientDTO getPatientByEmail(String email);

    PatientDTO getPatientByPhoneNumber(String phoneNumber);

    void updateLastVisitedDoctor(Long patientId, Long doctorId);

    PatientDTO getPatientWithLastVisitedDoctor(Long patientId);

    boolean existsByPhoneNumber(String phoneNumber);

    com.doc_app.booking.dto.UserInfoDTO findUserInfoByPhoneNumber(String phoneNumber);
}