package com.doc_app.booking.controller;

import com.doc_app.booking.dto.HospitalDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateHospitalRequest;
import com.doc_app.booking.dto.request.UpdateHospitalRequest;
import com.doc_app.booking.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping
    public ResponseEntity<ApiResponse<HospitalDTO>> createHospital(@Valid @RequestBody CreateHospitalRequest request) {
        HospitalDTO hospitalDTO = hospitalService.createHospital(request);
        return new ResponseEntity<>(ApiResponse.success("Hospital created successfully", hospitalDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalDTO>> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHospitalRequest request) {
        HospitalDTO hospitalDTO = hospitalService.updateHospital(id, request);
        return ResponseEntity.ok(ApiResponse.success("Hospital updated successfully", hospitalDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalDTO>> getHospital(@PathVariable Long id) {
        HospitalDTO hospitalDTO = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(ApiResponse.success(hospitalDTO));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<HospitalDTO>>> getAllHospitals(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<HospitalDTO> response = hospitalService.getAllHospitals(pageNo, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok(ApiResponse.success("Hospital deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HospitalDTO>>> searchHospitals(@RequestParam String keyword) {
        List<HospitalDTO> hospitals = hospitalService.searchHospitals(keyword);
        return ResponseEntity.ok(ApiResponse.success(hospitals));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<HospitalDTO>> getHospitalByEmail(@PathVariable String email) {
        HospitalDTO hospitalDTO = hospitalService.getHospitalByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(hospitalDTO));
    }
}