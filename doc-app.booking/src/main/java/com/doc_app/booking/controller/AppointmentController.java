package com.doc_app.booking.controller;

import com.doc_app.booking.dto.AppointmentDTO;
import com.doc_app.booking.dto.ApiResponse;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateAppointmentRequest;
import com.doc_app.booking.dto.request.UpdateAppointmentRequest;
import com.doc_app.booking.dto.request.AppointmentStatusUpdateRequest;
import com.doc_app.booking.model.AppointmentStatus;
import com.doc_app.booking.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment Management", description = "APIs for managing appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Operation(summary = "Create a new appointment", description = "Schedule a new appointment")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Created", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = AppointmentDTO.class)))
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentDTO appointmentDTO = appointmentService.createAppointment(request);
        return new ResponseEntity<>(ApiResponse.success("Appointment created successfully", appointmentDTO),
                HttpStatus.CREATED);
    }

    @PostMapping("/slot/{slotId}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointmentBySlot(@PathVariable Long slotId,
            @Valid @RequestBody CreateAppointmentRequest request) {
        // ensure slotId provided
        request.setSlotId(slotId);
        AppointmentDTO appointmentDTO = appointmentService.createAppointment(request);
        return new ResponseEntity<>(ApiResponse.success("Appointment created successfully via slot", appointmentDTO),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Update an appointment")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Updated", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = AppointmentDTO.class)))
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointment(@PathVariable Long id,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        AppointmentDTO appointmentDTO = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", appointmentDTO));
    }

    @Operation(summary = "Update appointment status")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = AppointmentDTO.class)))
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointmentStatus(@PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        AppointmentDTO appointmentDTO = appointmentService.updateAppointmentStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated successfully", appointmentDTO));
    }

    @Operation(summary = "Get appointment by ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Found", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = AppointmentDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointment(@PathVariable Long id) {
        AppointmentDTO appointmentDTO = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointmentDTO));
    }

    @Operation(summary = "Get all appointments")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = PageResponse.class)))
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDTO>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<AppointmentDTO> response = appointmentService.getAllAppointments(pageNo, pageSize, sortBy,
                sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Delete an appointment")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }

    // Specialized queries
    @Operation(summary = "Get appointments by patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByPatient(
            @Parameter(description = "ID of the patient", required = true) @PathVariable Long patientId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Get appointments by doctor")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByDoctor(
            @Parameter(description = "ID of the doctor", required = true) @PathVariable Long doctorId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Get appointments by status")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByStatus(
            @Parameter(description = "Appointment status (e.g., SCHEDULED, CONFIRMED, CANCELLED)", required = true) @PathVariable AppointmentStatus status) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Get appointments by date range")
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByDateRange(
            @Parameter(description = "Start date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Get doctor appointments by date range")
    @GetMapping("/doctor/{doctorId}/date-range")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByDoctorAndDateRange(
            @Parameter(description = "ID of the doctor", required = true) @PathVariable Long doctorId,
            @Parameter(description = "Start date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDoctorAndDateRange(doctorId, start,
                end);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Get patient appointments by date range")
    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByPatientAndDateRange(
            @Parameter(description = "ID of the patient", required = true) @PathVariable Long patientId,
            @Parameter(description = "Start date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientAndDateRange(patientId, start,
                end);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Get hospital appointments by date range")
    @GetMapping("/hospital/{hospitalId}/date-range")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByHospitalAndDateRange(
            @Parameter(description = "ID of the hospital", required = true) @PathVariable Long hospitalId,
            @Parameter(description = "Start date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End date and time (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByHospitalAndDateRange(hospitalId, start,
                end);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @Operation(summary = "Check doctor availability")
    @GetMapping("/doctor/{doctorId}/available")
    public ResponseEntity<ApiResponse<Boolean>> isDoctorAvailable(
            @Parameter(description = "ID of the doctor", required = true) @PathVariable Long doctorId,
            @Parameter(description = "Date and time to check availability (yyyy-MM-dd'T'HH:mm:ss)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime) {
        boolean isAvailable = appointmentService.isDoctorAvailable(doctorId, dateTime);
        return ResponseEntity.ok(ApiResponse.success(isAvailable));
    }
}