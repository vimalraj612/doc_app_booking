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

    @Mapping(target = "doctors", ignore = true)
    HospitalDTO toHospitalDTO(Hospital hospital);

    @Mapping(target = "doctors", ignore = true)
    @Mapping(target = "id", ignore = true)
    Hospital toHospital(CreateHospitalRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    void updateHospital(@MappingTarget Hospital hospital, UpdateHospitalRequest request);

    @Mapping(target = "hospitalId", source = "hospital.id")
    @Mapping(target = "hospitalName", source = "hospital.name")
    @Mapping(target = "phoneNumber", source = "contact")
    @Mapping(target = "appointments", ignore = true)
    DoctorDTO toDoctorDTO(Doctor doctor);

    @Mapping(target = "hospital", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contact", source = "phoneNumber")
    @Mapping(target = "profileImage", expression = "java(decodeBase64Image(request.getProfileImageBase64()))")
    Doctor toDoctor(CreateDoctorRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "hospital", ignore = true)
    @Mapping(target = "contact", source = "phoneNumber")
    @Mapping(target = "profileImage", expression = "java(decodeBase64Image(request.getProfileImageBase64()))")
    void updateDoctor(@MappingTarget Doctor doctor, UpdateDoctorRequest request);

    @Mapping(target = "appointments", ignore = true)
    PatientDTO toPatientDTO(Patient patient);

    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "id", ignore = true)
    Patient toPatient(CreatePatientRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    void updatePatient(@MappingTarget Patient patient, UpdatePatientRequest request);

    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "doctorName", expression = "java(appointment.getDoctor() != null ? appointment.getDoctor().getFirstName() + \" \" + appointment.getDoctor().getLastName() : null)")
    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", expression = "java(appointment.getPatient() != null ? appointment.getPatient().getFirstName() + \" \" + appointment.getPatient().getLastName() : null)")
    @Mapping(target = "appointeeName", source = "appointeeName")
    @Mapping(target = "appointeeAge", source = "appointeeAge")
    @Mapping(target = "appointeePhone", source = "appointeePhone")
    @Mapping(target = "appointeeGender", source = "appointeeGender")
    AppointmentDTO toAppointmentDTO(Appointment appointment);

    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "status", constant = "SCHEDULED")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointmentDateTime", source = "appointmentDateTime")
    @Mapping(target = "appointeeName", source = "appointeeName")
    @Mapping(target = "appointeeAge", source = "appointeeAge")
    @Mapping(target = "appointeePhone", source = "appointeePhone")
    @Mapping(target = "appointeeGender", source = "appointeeGender")
    Appointment toAppointment(CreateAppointmentRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "appointmentDateTime", source = "appointmentDateTime")
    void updateAppointment(@MappingTarget Appointment appointment, UpdateAppointmentRequest request);

    @Mapping(target = "appointmentId", source = "appointment.id")
    NotificationDTO toNotificationDTO(Notification notification);

    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "sent", constant = "false")
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipient", source = "recipient")
    @Mapping(target = "type", source = "type")
    Notification toNotification(CreateNotificationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "sent", ignore = true)
    @Mapping(target = "recipient", ignore = true)
    @Mapping(target = "type", ignore = true)
    void updateNotification(@MappingTarget Notification notification, UpdateNotificationRequest request);

    /**
     * Helper method to decode base64 image string to byte array
     */
    default byte[] decodeBase64Image(String base64Image) {
        if (base64Image == null || base64Image.trim().isEmpty()) {
            return null;
        }
        try {
            // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            String cleanBase64 = base64Image;
            if (base64Image.startsWith("data:")) {
                int commaIndex = base64Image.indexOf(',');
                if (commaIndex > 0) {
                    cleanBase64 = base64Image.substring(commaIndex + 1);
                }
            }
            return java.util.Base64.getDecoder().decode(cleanBase64);
        } catch (IllegalArgumentException e) {
            // Invalid base64 string
            return null;
        }
    }

}