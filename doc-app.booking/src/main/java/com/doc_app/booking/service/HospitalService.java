
package com.doc_app.booking.service;

import com.doc_app.booking.dto.HospitalDTO;
import com.doc_app.booking.dto.request.CreateHospitalRequest;
import com.doc_app.booking.dto.request.UpdateHospitalRequest;
import com.doc_app.booking.dto.PageResponse;
import java.util.List;

public interface HospitalService {
    HospitalDTO createHospital(CreateHospitalRequest request);

    HospitalDTO updateHospital(Long id, UpdateHospitalRequest request);

    HospitalDTO getHospitalById(Long id);

    PageResponse<HospitalDTO> getAllHospitals(int pageNo, int pageSize, String sortBy, String sortDir);

    void deleteHospital(Long id);

    HospitalDTO getHospitalByEmail(String email);

    HospitalDTO getHospitalByPhoneNumber(String phoneNumber);

    List<HospitalDTO> searchHospitals(String keyword);

    long getHospitalCount();

    boolean existsByPhoneNumber(String phoneNumber);

    com.doc_app.booking.dto.UserInfoDTO findUserInfoByPhoneNumber(String phoneNumber);
}