-- =============================================================================
-- INIZIALIZZAZIONE DATABASE BUGBOARD26 (init.sql)
-- =============================================================================

-- 1. Creazione Schema e Ruoli di Sicurezza
CREATE SCHEMA IF NOT EXISTS bugboard;

CREATE USER auth_service_user WITH PASSWORD 'auth_sec_pwd';
GRANT USAGE ON SCHEMA bugboard TO auth_service_user;

CREATE USER core_service_user WITH PASSWORD 'core_sec_pwd';
GRANT USAGE ON SCHEMA bugboard TO core_service_user;

SET search_path TO bugboard;

-- 2. Tabella Utenze (Auth Service)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permessi su users
GRANT ALL PRIVILEGES ON TABLE users TO auth_service_user;

-- Vista Read-Only per il Core Service
CREATE VIEW user_reference AS SELECT id, email, username, role FROM users;
GRANT SELECT ON user_reference TO core_service_user;

-- 3. Tabella Progetti
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabella Issue (Con FOREIGN KEYS implementate)
CREATE TABLE issues (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,     
    status VARCHAR(20) NOT NULL,   
    priority VARCHAR(20), 
    due_date DATE,        
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL, 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabella Allegati
CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL, 
    file_size BIGINT NOT NULL,
    upload_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE
);

-- 6. Tabella Audit / History
CREATE TABLE bug_history (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL, 
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    performed_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- 7. Tabella Notifiche
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permessi su dominio applicativo al Core Service
GRANT ALL PRIVILEGES ON TABLE projects, issues, attachments, bug_history, notifications TO core_service_user;

-- 8. Indici per Performance
CREATE INDEX idx_issues_project_status ON issues(project_id, status);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);
CREATE INDEX idx_issues_type ON issues(type);
CREATE INDEX idx_bug_history_bug_id ON bug_history(bug_id);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_user_id, is_read);