package com.doc_app.booking.repository;

import com.doc_app.booking.model.DistributedLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DistributedLockRepository extends JpaRepository<DistributedLock, Long> {
    
    /**
     * Find lock by name that is not expired
     */
    @Query("SELECT dl FROM DistributedLock dl WHERE dl.lockName = :lockName AND dl.expiresAt > :currentTime")
    Optional<DistributedLock> findActiveLockByName(@Param("lockName") String lockName, @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find lock by name regardless of expiry
     */
    Optional<DistributedLock> findByLockName(String lockName);
    
    /**
     * Delete expired locks
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM DistributedLock dl WHERE dl.expiresAt < :currentTime")
    int deleteExpiredLocks(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Update lock expiry time for renewal
     */
    @Modifying
    @Transactional
    @Query("UPDATE DistributedLock dl SET dl.expiresAt = :newExpiryTime, dl.updatedAt = :currentTime WHERE dl.lockName = :lockName AND dl.lockedBy = :instanceId")
    int renewLock(@Param("lockName") String lockName, @Param("instanceId") String instanceId, 
                  @Param("newExpiryTime") LocalDateTime newExpiryTime, @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Delete lock by name and instance (for releasing locks)
     */
    @Modifying
    @Transactional
    void deleteByLockNameAndLockedBy(String lockName, String lockedBy);
}