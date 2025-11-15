package com.doc_app.booking.service;

import java.time.Duration;

public interface DistributedLockService {
    
    /**
     * Try to acquire a distributed lock
     * @param lockName Name of the lock
     * @param duration How long to hold the lock
     * @return true if lock was acquired, false otherwise
     */
    boolean tryLock(String lockName, Duration duration);
    
    /**
     * Release a distributed lock
     * @param lockName Name of the lock to release
     * @return true if lock was released, false if lock wasn't held by this instance
     */
    boolean releaseLock(String lockName);
    
    /**
     * Renew an existing lock (extend its expiry time)
     * @param lockName Name of the lock to renew
     * @param duration New duration from now
     * @return true if lock was renewed, false if lock wasn't held by this instance
     */
    boolean renewLock(String lockName, Duration duration);
    
    /**
     * Execute a task with distributed lock protection
     * @param lockName Name of the lock
     * @param duration How long to hold the lock
     * @param task Task to execute if lock is acquired
     * @return true if task was executed, false if lock couldn't be acquired
     */
    boolean executeWithLock(String lockName, Duration duration, Runnable task);
    
    /**
     * Clean up expired locks
     */
    void cleanupExpiredLocks();
}