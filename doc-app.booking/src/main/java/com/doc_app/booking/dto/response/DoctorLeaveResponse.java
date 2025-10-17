package com.doc_app.booking.dto.response;

import java.time.LocalDate;

public class DoctorLeaveResponse {
    private Long id;
    private Long doctorId;
    private LocalDate date;
    private String reason;

    public DoctorLeaveResponse() {
    }

    public DoctorLeaveResponse(Long id, Long doctorId, LocalDate date, String reason) {
        this.id = id;
        this.doctorId = doctorId;
        this.date = date;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
