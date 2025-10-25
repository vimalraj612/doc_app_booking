package com.doc_app.booking.service;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateDoctorRequest;
import com.doc_app.booking.dto.request.UpdateDoctorRequest;
import java.util.List;

public interface DoctorService {
    DoctorDTO createDoctor(CreateDoctorRequest request);

    DoctorDTO updateDoctor(Long id, UpdateDoctorRequest request);

    DoctorDTO getDoctorById(Long id);

    PageResponse<DoctorDTO> getAllDoctors(int pageNo, int pageSize, String sortBy, String sortDir);

    PageResponse<DoctorDTO> getAllDoctors(
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
    );

    void deleteDoctor(Long id);

    List<DoctorDTO> getDoctorsByHospital(Long hospitalId);

    List<DoctorDTO> getDoctorsBySpecialization(String specialization);

    DoctorDTO getDoctorByEmail(String email);

    DoctorDTO getDoctorByContact(String contact);

    List<DoctorDTO> searchDoctors(String name, String specialization, Long hospitalId);

        long getDoctorCount(
                        String name,
                        String specialization,
                        String department,
                        Long hospitalId,
                        Integer minExperience,
                        Integer maxExperience,
                        String email,
                        String phoneNumber
        );

        boolean existsByContact(String contact);

        com.doc_app.booking.dto.UserInfoDTO findUserInfoByContact(String contact);
}