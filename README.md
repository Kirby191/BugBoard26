# 🐞 BugBoard26

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/maven-metadata/v.svg?metadataUrl=https%3A%2F%2Frepo1.maven.org%2Fmaven2%2Forg%2Fspringframework%2Fboot%2Fspring-boot-starter-parent%2Fmaven-metadata.xml&label=spring-boot&color=green&logo=spring-boot&style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-24+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/Microsoft_Azure-Deployed-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)

**BugBoard26** è una piattaforma *Enterprise* all'avanguardia per l'Issue Tracking e il Project Management. Progettata seguendo i principi di Ingegneria del Software (Alta Coesione, Basso Accoppiamento, Separation of Concerns...), offre un ambiente di lavoro fluido, sicuro e reattivo per la gestione del ciclo di vita dei bug e delle nuove funzionalità.

---

## 🚀 Deployment e Stato dell'Arte

L'applicazione è sviluppata adottando tecnologie e pattern architetturali **allo stato dell'arte** (CQRS, architettura Service-Based, RBAC). 
Il sistema è integralmente containerizzato tramite **Docker** ed è stato sottoposto a **deployment in ambiente cloud di produzione tramite Microsoft Azure** (Virtual Machine Linux). Il ciclo di rilascio è completamente automatizzato grazie a una pipeline di *Continuous Deployment (CD)* orchestrata tramite **GitHub Actions**, garantendo aggiornamenti *zero-downtime* e scalabilità orizzontale.

---

## 🏗️ Architettura del Sistema

Il sistema adotta un'architettura **Three-Tier Service-Based**. La logica di business e la sicurezza sono demandate al Back-End (diviso in due microservizi indipendenti), l'interfaccia e la UX/UI al Front-End (SPA Angular), e i dati a un'istanza isolata PostgreSQL.

La comunicazione tra Front-End e Back-End è rigorosamente focalizzata su **API RESTful stateless (su protocollo HTTP/HTTPS)**, protette mediante token **JWT (JSON Web Token)**.

### 🌐 Il Front-End (Angular SPA)
Il design, l'esperienza utente e la reattività risiedono interamente nell'applicazione Angular. Servito tramite **Nginx** (reverse proxy sulla porta 80), il frontend è diviso in moduli *Lazy Loaded* per massimizzare le performance.

```text
front-end/
└── src/app/
    ├── core-auth/             # Logica di Sicurezza Client-Side
    │   ├── guards/            # Protezione Rotte (RBAC: Admin/User)
    │   ├── interceptors/      # Iniezione JWT Token nelle chiamate HTTP
    │   └── components/        # Viste di Login e Registrazione
    │
    ├── issue/                 # Feature Module (Form Reattive e Modifica)
    │   ├── services/          # Comunicazione con il Command Layer (POST, PUT, DELETE)
    │   └── components/        # Liste, Dettaglio Issue, Upload Allegati (Multipart)
    │
    ├── dashboard-query/       # Interfaccia di Lettura e Monitoraggio
    │   ├── components/        # Metriche aggregate, Filtri Avanzati, Timeline
    │   └── services/          # Connessione Server-Sent Events (SSE) per Notifiche Live
    │
    └── shared/                # UI e Design Condiviso (Dumb Components)
        └── components/        # Navbar, Modali di Conferma, Status Badge
```

### ⚙️ Il Back-End (Spring Boot Java 21)
La logica applicativa, le validazioni di dominio, la persistenza e le policy di sicurezza risiedono nel back-end. È suddiviso in due processi separati per segregare le responsabilità critiche.

```text
back-end/
├── auth-service/              # (Porta 8081) Identità e Sicurezza
│   ├── config/                # Spring Security e Password Encoding (BCrypt)
│   ├── jwt/                   # Provider per generazione/validazione Token
│   └── service/               # Gestione DB Utenze (CRUD esclusivo)
│
└── core-service/              # (Porta 8080) Motore Applicativo (CQRS Pattern)
    ├── issue_management/      # [COMMAND] Operazioni di Scrittura, Check RBAC, Transazioni
    ├── query_view/            # [QUERY] Operazioni Read-Only, Filtri dinamici, Push SSE
    ├── history/               # [AUDIT] Tracciamento immutabile degli eventi (Event-Driven)
    └── attachment/            # [MEDIA] File Storage (Strategy Pattern: Locale/S3)
```

### 🗄️ Il Database (PostgreSQL)
Il layer di persistenza è un container Postgres isolato. Per garantire la **Defense in Depth**, applica il principio del minimo privilegio: l'`auth-service` ha pieni poteri sugli utenti, mentre il `core-service` gestisce il dominio applicativo potendo accedere all'anagrafica utenti solo in **sola lettura (READ-ONLY)** tramite una View SQL dedicata.

---

## ⚡ Come funziona la Comunicazione

1. **Autenticazione:** L'utente inserisce le credenziali nel Frontend (Angular). La richiesta viaggia verso l'`auth-service`. Se valide, il server restituisce un token JWT firmato crittograficamente.
2. **Autorizzazione:** L'Angular `JwtInterceptor` cattura ogni successiva chiamata HTTP e inietta il JWT nell'header.
3. **Gestione Dati (CQRS):** 
   - Quando l'utente *modifica* una Issue, la chiamata POST/PUT va all'`Issue Management Subsystem` del `core-service`, che valida la transazione, aggiorna il database ed emette un evento di Audit.
   - Quando l'utente *guarda* la Dashboard, la chiamata GET va al `Query & View Subsystem`, che preleva i dati aggregati in modo ultra-veloce senza mai mutare lo stato.
4. **Notifiche Real-Time:** Il Frontend apre una connessione persistente *Server-Sent Events (SSE)* con il Backend. Quando un bug viene riassegnato, il Backend "spinge" la notifica direttamente nell'interfaccia Angular senza che l'utente debba ricaricare la pagina.

---

## 🛠️ Setup e Installazione (Ambiente Locale)

Puoi avviare l'intero ecosistema con Docker in pochissimi passaggi:
0. Go to the source code dir
```bash
   cd '/Documentazione/Documentazione Finale/code/'
```
1. Copy `.env.example` to `.env`:
```bash
   cp .env.example .env
```
2. (Optional) Edit `.env` to change the default admin credentials, DB passwords, or JWT secret.
3. Run `docker compose up -d`.

Il sistema si configurerà automaticamente. Al termine della build:
- **Piattaforma Web:** [http://localhost](http://localhost) (Nginx + Angular)
- **Account Admin di default:** Le credenziali impostate nel tuo file `.env`.

---

## 👨‍💻 Autori
Progetto realizzato nell'ambito dell'insegnamento di Ingegneria del Software (A.A. 2025/2026) presso l'**Università degli Studi di Napoli Federico II**.
* Sviluppatore Software: **Vittorio Emanuele Testa**