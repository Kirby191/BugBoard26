package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.CreateIssue;
import com.bugboard26.core.issue_management.dto.UpdateIssue;
import com.bugboard26.core.issue_management.dto.IssueResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

/**
 * Interfaccia di servizio per la gestione del ciclo di vita delle Issue (Command Layer).
 * Definisce le operazioni di mutazione di stato (creazione, aggiornamento, scadenze).
 */
public interface IssueCommandService {

    /**
     * Crea una segnalazione e, se presente, collega il relativo allegato.
     *
     * @param request dati della segnalazione
     * @param file allegato opzionale
     * @return segnalazione persistita
     */
    IssueResponse createIssue(CreateIssue request, MultipartFile file);

    /** Aggiorna i campi valorizzati della segnalazione indicata. */
    IssueResponse updateIssue(Long id, UpdateIssue request, MultipartFile file);

    /** Modifica o rimuove la scadenza di una segnalazione. */
    IssueResponse setDueDate(Long id, LocalDate dueDate);

    /** Elimina una segnalazione dopo aver verificato i permessi dell'utente. */
    void deleteIssue(Long id);
}
