package com.doc_app.booking.dto;

import lombok.Data;
import java.util.List;

@Data
public class HospitalDTO {
    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private String website;
    private List<DoctorDTO> doctors;
}