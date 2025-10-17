package com.doc_app.booking.service;

import com.doc_app.booking.dto.DoctorDTO;
import java.util.List;

public interface CommonService {
    List<DoctorDTO> searchDoctors(String name, String specialization, String hospitalName);
}
