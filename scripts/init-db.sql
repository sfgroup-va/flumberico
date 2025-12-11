-- Database initialization script for PostgreSQL
-- This script runs automatically when the PostgreSQL container starts

-- Create additional user if needed (the main user is created by POSTGRES_USER env var)
-- DO NOT CREATE THE MAIN DATABASE HERE - it's created automatically by POSTGRES_DB

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create database configurations
ALTER DATABASE flumbericoco_db SET timezone = 'UTC';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE flumbericoco_db TO flumbericoco_user;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully for flumbericoco_db';
END $$;