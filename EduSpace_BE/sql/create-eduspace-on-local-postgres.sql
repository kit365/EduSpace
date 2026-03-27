-- Run as superuser (e.g. postgres) if you use a local PostgreSQL on localhost:5435
-- instead of Docker conversation-db, and the role "eduspace" does not exist yet.

CREATE ROLE eduspace WITH LOGIN PASSWORD 'eduspace_dev_123';
CREATE DATABASE eduspace_conversation OWNER eduspace;
GRANT ALL PRIVILEGES ON DATABASE eduspace_conversation TO eduspace;
