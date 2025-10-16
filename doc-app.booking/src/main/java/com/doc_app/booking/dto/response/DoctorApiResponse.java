package com.doc_app.booking.dto.response;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.ApiResponse;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Doctor API Response")
public class DoctorApiResponse extends ApiResponse<DoctorDTO> {
    public DoctorApiResponse(String message, DoctorDTO data) {
        super(true, message, data);
    }
}