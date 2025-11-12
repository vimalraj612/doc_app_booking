package com.doc_app.booking.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "patient_hospitals", uniqueConstraints = @UniqueConstraint(columnNames = {"patient_id", "hospital_id"}))
public class PatientHospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
}
