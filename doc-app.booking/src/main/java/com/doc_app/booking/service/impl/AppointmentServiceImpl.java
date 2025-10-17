package com.doc_app.booking.service.impl;

import com.doc_app.booking.dto.AppointmentDTO;
import com.doc_app.booking.dto.PageResponse;
import com.doc_app.booking.dto.request.CreateAppointmentRequest;
import com.doc_app.booking.dto.request.UpdateAppointmentRequest;
import com.doc_app.booking.dto.request.AppointmentStatusUpdateRequest;
import com.doc_app.booking.dto.mapper.EntityMapper;
import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Patient;
import com.doc_app.booking.model.AppointmentStatus;
import com.doc_app.booking.repository.AppointmentRepository;
import com.doc_app.booking.repository.DoctorRepository;
import com.doc_app.booking.repository.PatientRepository;
import com.doc_app.booking.service.AppointmentService;
import jakarta.persistence.EntityNotFoundException;
import com.doc_app.booking.exception.SlotAlreadyBookedException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final EntityMapper mapper;
    private final com.doc_app.booking.repository.SlotRepository slotRepository;

    @Override
    public AppointmentDTO createAppointment(CreateAppointmentRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + request.getPatientId()));

        // If slotId is provided, lock the slot and book it
        if (request.getSlotId() != null) {
            var slotOpt = slotRepository.findByIdForUpdate(request.getSlotId());
            var slot = slotOpt.orElseThrow(() -> new IllegalArgumentException("Slot not found"));
            if (!slot.isAvailable()) {
                throw new SlotAlreadyBookedException("Slot already booked");
            }

            // mark slot unavailable and save
            slot.setAvailable(false);
            slotRepository.save(slot);

            // create appointment at slot start
            Appointment appointment = mapper.toAppointment(request);
            appointment.setDoctor(doctor);
            appointment.setPatient(patient);
            appointment.setAppointmentDateTime(LocalDateTime.of(slot.getDate(), slot.getStartTime()));
            appointment = appointmentRepository.save(appointment);
            return mapper.toAppointmentDTO(appointment);
        }

        // fallback: legacy behavior using appointmentDateTime
        if (!isDoctorAvailable(request.getDoctorId(), request.getAppointmentDateTime())) {
            throw new IllegalStateException("Doctor is not available at the requested time");
        }

        Appointment appointment = mapper.toAppointment(request);
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment = appointmentRepository.save(appointment);
        return mapper.toAppointmentDTO(appointment);
    }

    @Override
    public AppointmentDTO updateAppointment(Long id, UpdateAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));

        if (request.getAppointmentDateTime() != null &&
                !request.getAppointmentDateTime().equals(appointment.getAppointmentDateTime()) &&
                !isDoctorAvailable(appointment.getDoctor().getId(), request.getAppointmentDateTime())) {
            throw new IllegalStateException("Doctor is not available at the requested time");
        }

        mapper.updateAppointment(appointment, request);
        appointment = appointmentRepository.save(appointment);
        return mapper.toAppointmentDTO(appointment);
    }

    @Override
    public AppointmentDTO updateAppointmentStatus(Long id, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));

        appointment.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        appointment = appointmentRepository.save(appointment);
        return mapper.toAppointmentDTO(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));
        return mapper.toAppointmentDTO(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentDTO> getAllAppointments(int pageNo, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Appointment> appointments = appointmentRepository.findAll(pageable);

        List<AppointmentDTO> content = appointments.getContent().stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                appointments.getNumber(),
                appointments.getSize(),
                appointments.getTotalElements(),
                appointments.getTotalPages(),
                appointments.isLast());
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));
        appointmentRepository.delete(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status).stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByAppointmentDateTimeBetweenAndStatus(start, end, AppointmentStatus.SCHEDULED)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDoctorAndDateRange(Long doctorId, LocalDateTime start,
            LocalDateTime end) {
        return appointmentRepository.findByDoctorIdAndDateRange(doctorId, start, end).stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatientAndDateRange(Long patientId, LocalDateTime start,
            LocalDateTime end) {
        return appointmentRepository.findByPatientIdAndDateRange(patientId, start, end).stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByHospitalAndDateRange(Long hospitalId, LocalDateTime start,
            LocalDateTime end) {
        return appointmentRepository.findByHospitalIdAndDateRange(hospitalId, start, end).stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDoctorAvailable(Long doctorId, LocalDateTime dateTime) {
        return !appointmentRepository.existsByDoctorAndDateTime(doctorId, dateTime);
    }
}