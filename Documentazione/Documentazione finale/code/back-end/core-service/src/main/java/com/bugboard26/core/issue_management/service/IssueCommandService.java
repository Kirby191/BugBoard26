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

    IssueResponse createIssue(CreateIssue request, MultipartFile file);

    IssueResponse updateIssue(Long id, UpdateIssue request);

    IssueResponse setDueDate(Long id, LocalDate dueDate);

}
