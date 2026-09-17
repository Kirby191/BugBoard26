package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.service.HistoryService;
import com.bugboard26.core.issue_management.dto.AssignBug;
import com.bugboard26.core.issue_management.dto.IssueResponse;
import com.bugboard26.core.issue_management.event.BugAssignedEvent;
import com.bugboard26.core.issue_management.event.BugUnassignedEvent;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.shared.exception.UserNotFoundException;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.repository.IssueRepository;
import com.bugboard26.core.issue_management.repository.ReadOnlyUserRepository;
import com.bugboard26.core.issue_management.validator.AccessControlValidator;
import com.bugboard26.core.issue_management.validator.IssueDomainValidator;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Servizio isolato per l'assegnazione dei task (Funzionalità 4) 15].
 * Rispetta l'Interface Segregation Principle e orchestra il Command Layer in modo Event-Driven 16].
 */
@Service
public class AssignBugServiceImpl implements AssignBugService {

    private final IssueRepository issueRepository;
    private final ReadOnlyUserRepository userRepository;
    private final AccessControlValidator accessControlValidator;
    private final IssueDomainValidator domainValidator;
    private final HistoryService historyService;
    private final ApplicationEventPublisher eventPublisher;
    private final AuthenticatedUserProvider userProvider;

    public AssignBugServiceImpl(IssueRepository issueRepository,
                                ReadOnlyUserRepository userRepository,
                                AccessControlValidator accessControlValidator,
                                IssueDomainValidator domainValidator,
                                HistoryService historyService,
                                ApplicationEventPublisher eventPublisher,
                                AuthenticatedUserProvider userProvider) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.accessControlValidator = accessControlValidator;
        this.domainValidator = domainValidator;
        this.historyService = historyService;
        this.eventPublisher = eventPublisher;
        this.userProvider = userProvider;
    }

@Override
    @Transactional
    public IssueResponse assignBug(Long id, AssignBug request) {
        // 1. Controllo di sicurezza: solo gli amministratori possono assegnare i bug
        accessControlValidator.canManageProjects();

        // 2. Recupero l'entità Issue
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue non trovata con ID: " + id));

        // 3. Verifica Invariante di Dominio
        domainValidator.validateAssignable(issue);

        Long newAssigneeId = request.assigneeId();
        Long currentAdminId = userProvider.getCurrentUserId();

        // 4. EVITA LOG INUTILI: Se l'assegnatario è lo stesso, non fare nulla
        if (java.util.Objects.equals(issue.getAssigneeId(), newAssigneeId)) {
            return buildResponse(issue);
        }

        // 5. RIMOZIONE ASSEGNAZIONE
        if (newAssigneeId == null) {
        Long previousAssigneeId = issue.getAssigneeId(); // Cattura l'ID prima di azzerarlo
        issue.setAssigneeId(null);
        Issue savedIssue = issueRepository.save(issue);

        historyService.recordEvent(savedIssue.getId(), currentAdminId, AuditAction.ASSIGNED, "L'amministratore ha rimosso l'assegnazione del task.");

        // Pubblica l'evento per rimuovere le notifiche pendenti e avvisare l'utente
        if (previousAssigneeId != null) {
            eventPublisher.publishEvent(new BugUnassignedEvent(
                    savedIssue.getId(),
                    previousAssigneeId,
                    LocalDateTime.now(ZoneId.systemDefault())
            ));
        }
        return buildResponse(savedIssue);
    }

        // 6. NUOVA ASSEGNAZIONE / RIASSEGNAZIONE
        if (!userRepository.existsById(newAssigneeId)) {
            throw new UserNotFoundException("Utente assegnatario inesistente con ID: " + newAssigneeId);
        }

        issue.setAssigneeId(newAssigneeId);
        Issue savedIssue = issueRepository.save(issue);

        historyService.recordEvent(
                savedIssue.getId(),
                currentAdminId,
                AuditAction.ASSIGNED,
                "Bug assegnato all'utente con ID: " + newAssigneeId
        );

        // Pubblicazione ASINCRONA dell'evento per le Notifiche (Solo se c'è un destinatario fisico)
        eventPublisher.publishEvent(new BugAssignedEvent(
                savedIssue.getId(),
                newAssigneeId,
                LocalDateTime.now(ZoneId.systemDefault())
        ));

        return buildResponse(savedIssue);
    }

        // Metodo helper
        private IssueResponse buildResponse(Issue savedIssue) {
                return new IssueResponse(
                        savedIssue.getId(),
                        savedIssue.getProjectId(),
                        savedIssue.getTitle(),
                        savedIssue.getStatus(),
                        savedIssue.getType(),
                        savedIssue.getPriority(),
                        savedIssue.getAssigneeId()
                );
        }
}
