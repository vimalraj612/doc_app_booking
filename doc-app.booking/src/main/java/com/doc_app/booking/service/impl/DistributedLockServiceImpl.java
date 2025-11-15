package com.doc_app.booking.service.impl;

import com.doc_app.booking.model.DistributedLock;
import com.doc_app.booking.repository.DistributedLockRepository;
import com.doc_app.booking.service.DistributedLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DistributedLockServiceImpl implements DistributedLockService {

    private final DistributedLockRepository lockRepository;
    
    @Value("${spring.application.name:doc-app-booking}")
    private String applicationName;
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    private String getInstanceId() {
        try {
            String hostname = InetAddress.getLocalHost().getHostName();
            return applicationName + "-" + hostname + ":" + serverPort + "-" + System.currentTimeMillis();
        } catch (Exception e) {
            return applicationName + "-" + serverPort + "-" + System.currentTimeMillis();
        }
    }

    @Override
    @Transactional
    public boolean tryLock(String lockName, Duration duration) {
        String instanceId = getInstanceId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plus(duration);
        
        try {
            // First, try to clean up expired lock if it exists
            Optional<DistributedLock> existingLock = lockRepository.findByLockName(lockName);
            if (existingLock.isPresent()) {
                DistributedLock lock = existingLock.get();
                if (lock.isExpired()) {
                    log.debug("Removing expired lock: {} previously held by {}", lockName, lock.getLockedBy());
                    lockRepository.delete(lock);
                } else {
                    log.debug("Lock {} is currently held by {} until {}", 
                        lockName, lock.getLockedBy(), lock.getExpiresAt());
                    return false;
                }
            }
            
            // Try to create new lock
            DistributedLock newLock = new DistributedLock(lockName, instanceId, expiresAt);
            lockRepository.save(newLock);
            
            log.info("Successfully acquired lock: {} by instance: {} until {}", 
                lockName, instanceId, expiresAt);
            return true;
            
        } catch (DataIntegrityViolationException e) {
            // Another instance acquired the lock just before us
            log.debug("Failed to acquire lock: {} - already held by another instance", lockName);
            return false;
        } catch (Exception e) {
            log.error("Error while trying to acquire lock: {}", lockName, e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean releaseLock(String lockName) {
        String instanceId = getInstanceId();
        
        try {
            Optional<DistributedLock> lockOpt = lockRepository.findByLockName(lockName);
            if (lockOpt.isPresent()) {
                DistributedLock lock = lockOpt.get();
                
                // Check if this instance holds the lock
                if (!lock.getLockedBy().startsWith(applicationName + "-")) {
                    log.debug("Cannot release lock: {} - not held by this application instance", lockName);
                    return false;
                }
                
                lockRepository.delete(lock);
                log.info("Successfully released lock: {} by instance: {}", lockName, instanceId);
                return true;
            } else {
                log.debug("Lock: {} not found for release", lockName);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error while releasing lock: {}", lockName, e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean renewLock(String lockName, Duration duration) {
        String instanceId = getInstanceId();
        LocalDateTime newExpiryTime = LocalDateTime.now().plus(duration);
        
        try {
            int updatedRows = lockRepository.renewLock(lockName, instanceId, newExpiryTime, LocalDateTime.now());
            
            if (updatedRows > 0) {
                log.debug("Successfully renewed lock: {} by instance: {} until {}", 
                    lockName, instanceId, newExpiryTime);
                return true;
            } else {
                log.debug("Failed to renew lock: {} - not held by this instance", lockName);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error while renewing lock: {}", lockName, e);
            return false;
        }
    }

    @Override
    public boolean executeWithLock(String lockName, Duration duration, Runnable task) {
        if (tryLock(lockName, duration)) {
            try {
                log.debug("Executing task with lock: {}", lockName);
                task.run();
                return true;
            } finally {
                releaseLock(lockName);
            }
        } else {
            log.debug("Could not acquire lock: {} - skipping task execution", lockName);
            return false;
        }
    }

    @Override
    @Transactional
    public void cleanupExpiredLocks() {
        try {
            int deletedCount = lockRepository.deleteExpiredLocks(LocalDateTime.now());
            if (deletedCount > 0) {
                log.info("Cleaned up {} expired locks", deletedCount);
            }
        } catch (Exception e) {
            log.error("Error during lock cleanup", e);
        }
    }
}