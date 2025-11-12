package com.doc_app.booking.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "patient_relations")
public class PatientRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String fullName;

    private Integer age;

    @Column(nullable = true)
    private String phoneNumber;

    private String gender;

    @Column(nullable = false)
    private String relationship;
}
