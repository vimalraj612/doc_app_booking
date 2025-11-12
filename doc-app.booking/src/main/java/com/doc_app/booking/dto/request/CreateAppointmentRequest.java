package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateAppointmentRequest {
    @NotNull(message = "{" + MessageKeys.DOCTOR_ID_REQUIRED + "}")
    @Positive(message = "{" + MessageKeys.DOCTOR_ID_POSITIVE + "}")
    private Long doctorId;

    // Patient identification by phone number (unique identifier, optional for
    // reserved)
    @ValidPhoneNumber(optional = true)
    private String patientPhone;

    // Optional for reserved appointments
    @Size(min = 2, max = 150, message = "{" + MessageKeys.PATIENT_NAME_SIZE + "}")
    private String patientName;

    @NotNull(message = "{" + MessageKeys.APPOINTMENT_DATE_TIME_REQUIRED + "}")
    @FutureOrPresent(message = "{" + MessageKeys.APPOINTMENT_DATE_TIME_FUTURE + "}")
    private LocalDateTime appointmentDateTime;

    private String appointeeName;
    private Integer appointeeAge;
    
    @ValidPhoneNumber(optional = true)
    private String appointeePhone;
    
    private String appointeeGender;

    // optional: if provided, book this slot
    @Positive(message = "{" + MessageKeys.SLOT_ID_POSITIVE + "}")
    private Long slotId;

    @Size(max = 1000, message = "{" + MessageKeys.NOTES_SIZE + "}")
    private String notes;

    private LocalDateTime followUpDate;

    private boolean reserved;

    public boolean isReserved() {
        return reserved || (patientPhone == null || patientPhone.isBlank());
    }
}