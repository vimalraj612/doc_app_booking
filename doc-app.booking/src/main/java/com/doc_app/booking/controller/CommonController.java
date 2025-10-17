package com.doc_app.booking.controller;

import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.service.CommonService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/common")
@RequiredArgsConstructor
public class CommonController {

    private final CommonService commonService;

    @Operation(summary = "Search doctors by name, specialization or hospital")
    @GetMapping("/search/doctors")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> searchDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String hospitalName) {

        List<DoctorDTO> doctors = commonService.searchDoctors(name, specialization, hospitalName);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }
}
