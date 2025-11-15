package com.doc_app.booking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "distributed_locks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DistributedLock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "lock_name", nullable = false, unique = true)
    private String lockName;
    
    @Column(name = "locked_by", nullable = false)
    private String lockedBy;
    
    @Column(name = "locked_at", nullable = false)
    private LocalDateTime lockedAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (lockedAt == null) {
            lockedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public DistributedLock(String lockName, String lockedBy, LocalDateTime expiresAt) {
        this.lockName = lockName;
        this.lockedBy = lockedBy;
        this.expiresAt = expiresAt;
        this.lockedAt = LocalDateTime.now();
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}