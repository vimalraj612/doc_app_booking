package com.doc_app.booking.controller;

import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateDoctorRequest;
import com.doc_app.booking.dto.request.UpdateDoctorRequest;
import com.doc_app.booking.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor Management", description = "APIs for managing doctors")
public class DoctorController {

    private final DoctorService doctorService;

    @Operation(summary = "Create a new doctor", description = "Creates a new doctor with the provided information")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Doctor created successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request body")
    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDTO>> createDoctor(
            @Parameter(description = "Doctor creation request body", required = true) @Valid @RequestBody CreateDoctorRequest request) {
        DoctorDTO doctorDTO = doctorService.createDoctor(request);
        return new ResponseEntity<>(ApiResponse.success("Doctor created successfully", doctorDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing doctor", description = "Updates a doctor's information based on the provided ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor updated successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctor(
            @Parameter(description = "ID of the doctor to update", required = true) @PathVariable Long id,
            @Parameter(description = "Doctor update request body", required = true) @Valid @RequestBody UpdateDoctorRequest request) {
        DoctorDTO doctorDTO = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", doctorDTO));
    }

    @Operation(summary = "Get a doctor by ID", description = "Retrieves detailed information about a specific doctor")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor found successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = DoctorDTO.class)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctor(
            @Parameter(description = "ID of the doctor to retrieve", required = true) @PathVariable Long id) {
        DoctorDTO doctorDTO = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctorDTO));
    }

    @Operation(summary = "Get all doctors", description = "Retrieves a paginated list of all doctors with sorting options")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of doctors retrieved successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = PageResponse.class)))
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DoctorDTO>>> getAllDoctors(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page", example = "10") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by", example = "name") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)", example = "asc") @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<DoctorDTO> response = doctorService.getAllDoctors(pageNo, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Delete a doctor", description = "Removes a doctor from the system")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Doctor deleted successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Doctor not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(
            @Parameter(description = "ID of the doctor to delete", required = true) @PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", null));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsByHospital(@PathVariable Long hospitalId) {
        List<DoctorDTO> doctors = doctorService.getDoctorsByHospital(hospitalId);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsBySpecialization(
            @PathVariable String specialization) {
        List<DoctorDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorByEmail(@PathVariable String email) {
        DoctorDTO doctorDTO = doctorService.getDoctorByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(doctorDTO));
    }
}