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
import com.doc_app.booking.service.PatientService;
import jakarta.persistence.EntityNotFoundException;
import com.doc_app.booking.exception.SlotAlreadyBookedException;
import com.doc_app.booking.exception.PatientNotFoundException;
import com.doc_app.booking.exception.DoctorNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PatientService patientService;
    private final EntityMapper mapper;
    private final com.doc_app.booking.repository.SlotRepository slotRepository;

    @Override
    public AppointmentDTO createAppointment(CreateAppointmentRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        // Find patient by phone number (unique identifier)
        Patient patient = patientRepository.findByPhoneNumber(request.getPatientPhone())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientPhone()));

        // Verify patient name matches if provided in request
        if (request.getPatientName() != null && !request.getPatientName().isBlank()) {
            String fullName = (patient.getFirstName() + " " + patient.getLastName()).trim();
            if (!fullName.equalsIgnoreCase(request.getPatientName().trim())) {
                log.warn("Patient name mismatch for phone {}: expected '{}', provided '{}'", 
                    request.getPatientPhone(), fullName, request.getPatientName());
            }
        }

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

            // create appointment at slot start, link slot
            Appointment appointment = mapper.toAppointment(request);
            appointment.setDoctor(doctor);
            appointment.setPatient(patient);
            appointment.setSlot(slot);
            appointment.setAppointmentDateTime(LocalDateTime.of(slot.getDate(), slot.getStartTime()));
            if (request.getAppointmentType() != null) {
                appointment.setAppointmentType(request.getAppointmentType());
            }
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
        if (request.getAppointmentType() != null) {
            appointment.setAppointmentType(request.getAppointmentType());
        }
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

        // Update last visited doctor when appointment is completed
        if (request.getStatus() == AppointmentStatus.COMPLETED) {
            patientService.updateLastVisitedDoctor(appointment.getPatient().getId(), appointment.getDoctor().getId());
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
    List<AppointmentStatus> allowed = List.of(
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
    );
    return appointmentRepository.findByPatientIdAndStatusIn(patientId, allowed).stream()
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
    List<AppointmentStatus> allowed = List.of(
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
    );
    return appointmentRepository.findByDoctorIdAndDateRangeAndStatusIn(doctorId, start, end, allowed).stream()
        .map(mapper::toAppointmentDTO)
        .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatientAndDateRange(Long patientId, LocalDateTime start,
            LocalDateTime end) {
    List<AppointmentStatus> allowed = List.of(
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
    );
    return appointmentRepository.findByPatientIdAndDateRangeAndStatusIn(patientId, start, end, allowed).stream()
        .map(mapper::toAppointmentDTO)
        .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByHospitalAndDateRange(Long hospitalId, LocalDateTime start,
            LocalDateTime end) {
    List<AppointmentStatus> allowed = List.of(
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
    );
    return appointmentRepository.findByHospitalIdAndDateRangeAndStatusIn(hospitalId, start, end, allowed).stream()
        .map(mapper::toAppointmentDTO)
        .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDoctorAvailable(Long doctorId, LocalDateTime dateTime) {
        return !appointmentRepository.existsByDoctorAndDateTime(doctorId, dateTime);
    }
}