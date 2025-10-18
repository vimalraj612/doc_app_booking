package com.doc_app.booking.model;

/**
 * User roles for authentication and authorization
 */
public enum Role {
    HOSPITAL_ADMIN("hospital_admin"),
    DOCTOR("doctor"),
    PATIENT("patient");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}