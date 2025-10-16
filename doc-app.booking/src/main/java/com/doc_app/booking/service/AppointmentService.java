package com.doc_app.booking.service;

import com.doc_app.booking.dto.AppointmentDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateAppointmentRequest;
import com.doc_app.booking.dto.request.UpdateAppointmentRequest;
import com.doc_app.booking.dto.request.AppointmentStatusUpdateRequest;
import com.doc_app.booking.model.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {
    AppointmentDTO createAppointment(CreateAppointmentRequest request);
    AppointmentDTO updateAppointment(Long id, UpdateAppointmentRequest request);
    AppointmentDTO updateAppointmentStatus(Long id, AppointmentStatusUpdateRequest request);
    AppointmentDTO getAppointmentById(Long id);
    PageResponse<AppointmentDTO> getAllAppointments(int pageNo, int pageSize, String sortBy, String sortDir);
    void deleteAppointment(Long id);
    List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId);
    List<AppointmentDTO> getAppointmentsByPatient(Long patientId);
    List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status);
    List<AppointmentDTO> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end);
    List<AppointmentDTO> getAppointmentsByDoctorAndDateRange(Long doctorId, LocalDateTime start, LocalDateTime end);
    List<AppointmentDTO> getAppointmentsByPatientAndDateRange(Long patientId, LocalDateTime start, LocalDateTime end);
    List<AppointmentDTO> getAppointmentsByHospitalAndDateRange(Long hospitalId, LocalDateTime start, LocalDateTime end);
    boolean isDoctorAvailable(Long doctorId, LocalDateTime dateTime);
}