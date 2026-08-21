-- Creazione dello schema applicativo isolato
CREATE SCHEMA IF NOT EXISTS bugboard;

-- 1. Creazione utente per Auth Service (Privilegi completi sulla tabella users)
CREATE USER auth_service_user WITH PASSWORD 'auth_sec_pwd';
GRANT USAGE ON SCHEMA bugboard TO auth_service_user;

-- (Hibernate si occuperà di creare la tabella 'users' al primo avvio)
-- Diamo ad auth_service_user i diritti di creare tabelle nello schema
GRANT CREATE ON SCHEMA bugboard TO auth_service_user;

-- 2. Creazione utente per Core Service (CRUD su dominio, READ-ONLY su utenti)
CREATE USER core_service_user WITH PASSWORD 'core_sec_pwd';
GRANT USAGE ON SCHEMA bugboard TO core_service_user;
GRANT CREATE ON SCHEMA bugboard TO core_service_user;

-- Assicuriamoci che tutte le future tabelle create in bugboard siano accessibili
ALTER DEFAULT PRIVILEGES IN SCHEMA bugboard GRANT ALL ON TABLES TO auth_service_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA bugboard GRANT ALL ON TABLES TO core_service_user;