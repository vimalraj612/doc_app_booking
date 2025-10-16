package com.doc_app.booking.dto;

import lombok.Data;
import java.util.List;

@Data
public class DoctorDTO {
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private String phoneNumber;
    private Long hospitalId;
    private String hospitalName;
    private List<AppointmentDTO> appointments;
}
