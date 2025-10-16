package com.doc_app.booking.dto.mapper;

import com.doc_app.booking.dto.AppointmentDTO;
import com.doc_app.booking.dto.DoctorDTO;
import com.doc_app.booking.dto.HospitalDTO;
import com.doc_app.booking.dto.NotificationDTO;
import com.doc_app.booking.dto.PatientDTO;
import com.doc_app.booking.dto.request.CreateAppointmentRequest;
import com.doc_app.booking.dto.request.CreateDoctorRequest;
import com.doc_app.booking.dto.request.CreateHospitalRequest;
import com.doc_app.booking.dto.request.CreateNotificationRequest;
import com.doc_app.booking.dto.request.CreatePatientRequest;
import com.doc_app.booking.dto.request.UpdateAppointmentRequest;
import com.doc_app.booking.dto.request.UpdateDoctorRequest;
import com.doc_app.booking.dto.request.UpdateHospitalRequest;
import com.doc_app.booking.dto.request.UpdateNotificationRequest;
import com.doc_app.booking.dto.request.UpdatePatientRequest;
import com.doc_app.booking.model.Appointment;
import com.doc_app.booking.model.Doctor;
import com.doc_app.booking.model.Hospital;
import com.doc_app.booking.model.Notification;
import com.doc_app.booking.model.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Entity mapper interface for converting between DTOs and domain models.
 * Uses MapStruct for automatic implementation of mapping methods.
 */
@Mapper(componentModel = "spring")
public interface EntityMapper {

    /**
     * Hospital mapping methods
     */

    /**
     * Converts a Hospital entity to a HospitalDTO.
     * 
     * @param hospital the hospital entity to convert
     * @return the hospital DTO
     */
    @Mapping(target = "doctors", ignore = true)
    HospitalDTO toHospitalDTO(Hospital hospital);

    /**
     * Creates a new Hospital entity from a CreateHospitalRequest.
     * 
     * @param request the creation request
     * @return the new hospital entity
     */
    @Mapping(target = "doctors", ignore = true)
    @Mapping(target = "id", ignore = true)
    Hospital toHospital(CreateHospitalRequest request);

    /**
     * Updates a Hospital entity with data from an UpdateHospitalRequest.
     * 
     * @param hospital the hospital entity to update
     * @param request  the update request containing new data
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    void updateHospital(@MappingTarget Hospital hospital, UpdateHospitalRequest request);

    /**
     * Doctor mapping methods
     */

    /**
     * Converts a Doctor entity to a DoctorDTO.
     * 
     * @param doctor the doctor entity to convert
     * @return the doctor DTO
     */
    @Mapping(target = "hospitalId", source = "hospital.id")
    @Mapping(target = "hospitalName", source = "hospital.name")
    @Mapping(target = "phoneNumber", source = "contact")
    @Mapping(target = "appointments", ignore = true)
    DoctorDTO toDoctorDTO(Doctor doctor);

    /**
     * Creates a new Doctor entity from a CreateDoctorRequest.
     * 
     * @param request the creation request
     * @return the new doctor entity
     */
    @Mapping(target = "hospital", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contact", source = "phoneNumber")
    Doctor toDoctor(CreateDoctorRequest request);

    /**
     * Updates a Doctor entity with data from an UpdateDoctorRequest.
     * 
     * @param doctor  the doctor entity to update
     * @param request the update request containing new data
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "hospital", ignore = true)
    @Mapping(target = "contact", source = "phoneNumber")
    void updateDoctor(@MappingTarget Doctor doctor, UpdateDoctorRequest request);

    /**
     * Patient mapping methods
     */

    /**
     * Converts a Patient entity to a PatientDTO.
     * 
     * @param patient the patient entity to convert
     * @return the patient DTO
     */
    @Mapping(target = "appointments", ignore = true)
    PatientDTO toPatientDTO(Patient patient);

    /**
     * Creates a new Patient entity from a CreatePatientRequest.
     * 
     * @param request the creation request
     * @return the new patient entity
     */
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "id", ignore = true)
    Patient toPatient(CreatePatientRequest request);

    /**
     * Updates a Patient entity with data from an UpdatePatientRequest.
     * 
     * @param patient the patient entity to update
     * @param request the update request containing new data
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    void updatePatient(@MappingTarget Patient patient, UpdatePatientRequest request);

    /**
     * Appointment mapping methods
     */

    /**
     * Converts an Appointment entity to an AppointmentDTO.
     * 
     * @param appointment the appointment entity to convert
     * @return the appointment DTO
     */
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "doctorName", source = "doctor.name")
    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", expression = "java(appointment.getPatient() != null ? appointment.getPatient().getFirstName() + \" \" + appointment.getPatient().getLastName() : null)")
    AppointmentDTO toAppointmentDTO(Appointment appointment);

    /**
     * Creates a new Appointment entity from a CreateAppointmentRequest.
     * 
     * @param request the creation request
     * @return the new appointment entity
     */
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "status", constant = "SCHEDULED")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointmentDateTime", source = "appointmentDateTime")
    Appointment toAppointment(CreateAppointmentRequest request);

    /**
     * Updates an Appointment entity with data from an UpdateAppointmentRequest.
     * 
     * @param appointment the appointment entity to update
     * @param request     the update request containing new data
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "appointmentDateTime", source = "appointmentDateTime")
    void updateAppointment(@MappingTarget Appointment appointment, UpdateAppointmentRequest request);

    /**
     * Notification mapping methods
     */

    /**
     * Converts a Notification entity to a NotificationDTO.
     * 
     * @param notification the notification entity to convert
     * @return the notification DTO
     */
    @Mapping(target = "appointmentId", source = "appointment.id")
    NotificationDTO toNotificationDTO(Notification notification);

    /**
     * Creates a new Notification entity from a CreateNotificationRequest.
     * 
     * @param request the creation request
     * @return the new notification entity
     */
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "sent", constant = "false")
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipient", source = "recipient")
    @Mapping(target = "type", source = "type")
    Notification toNotification(CreateNotificationRequest request);

    /**
     * Updates a Notification entity with data from an UpdateNotificationRequest.
     * 
     * @param notification the notification entity to update
     * @param request      the update request containing new data
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "sent", ignore = true)
    @Mapping(target = "recipient", ignore = true)
    @Mapping(target = "type", ignore = true)
    void updateNotification(@MappingTarget Notification notification, UpdateNotificationRequest request);
}