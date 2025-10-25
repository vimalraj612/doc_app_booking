package com.doc_app.booking.controller;

import com.doc_app.booking.dto.HospitalDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateHospitalRequest;
import com.doc_app.booking.dto.request.UpdateHospitalRequest;
import com.doc_app.booking.service.HospitalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
@Tag(name = "Hospitals", description = "Hospital management APIs with public signup")
@SecurityRequirement(name = "Bearer Authentication")
@Slf4j
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping
    @Operation(summary = "Create new hospital - System Admin only (for staff use)")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('SUPERADMIN')") // This would need a super admin role
    public ResponseEntity<ApiResponse<HospitalDTO>> createHospital(@Valid @RequestBody CreateHospitalRequest request) {
        // This endpoint is for System Admin to create hospitals directly (if
        // implemented)
        HospitalDTO hospitalDTO = hospitalService.createHospital(request);
        return new ResponseEntity<>(ApiResponse.success("Hospital created successfully", hospitalDTO),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update hospital - Hospital Admin can only update their own hospital")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<ApiResponse<HospitalDTO>> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHospitalRequest request,
            HttpServletRequest httpRequest) {

        // Get user details from JWT filter
        Long userId = (Long) httpRequest.getAttribute("userId");
        String userRole = (String) httpRequest.getAttribute("userRole");

        // Hospital admin can only update their own hospital
        if ("HOSPITAL_ADMIN".equals(userRole) && !userId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only update your own hospital"));
        }

        HospitalDTO hospitalDTO = hospitalService.updateHospital(id, request);
        return ResponseEntity.ok(ApiResponse.success("Hospital updated successfully", hospitalDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalDTO>> getHospital(@PathVariable Long id) {
        HospitalDTO hospitalDTO = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(ApiResponse.success(hospitalDTO));
    }

    @GetMapping("/count")
    @Operation(summary = "Get total count of hospitals")
    public ResponseEntity<ApiResponse<Long>> getHospitalCount() {
        long count = hospitalService.getHospitalCount();
        return ResponseEntity.ok(ApiResponse.success(count));
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