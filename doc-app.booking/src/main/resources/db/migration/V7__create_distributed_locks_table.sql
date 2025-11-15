-- Create distributed_locks table for managing scheduler locks across multiple instances
CREATE TABLE distributed_locks (
    id SERIAL PRIMARY KEY,
    lock_name VARCHAR(255) NOT NULL UNIQUE,
    locked_by VARCHAR(255) NOT NULL, -- instance identifier
    locked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_distributed_locks_name_expires ON distributed_locks(lock_name, expires_at);

-- Add some comments
COMMENT ON TABLE distributed_locks IS 'Table for managing distributed locks across multiple application instances';
COMMENT ON COLUMN distributed_locks.lock_name IS 'Unique name of the lock (e.g., scheduler_daily_reminders)';
COMMENT ON COLUMN distributed_locks.locked_by IS 'Instance identifier that holds the lock';
COMMENT ON COLUMN distributed_locks.expires_at IS 'When the lock expires (for automatic cleanup)';