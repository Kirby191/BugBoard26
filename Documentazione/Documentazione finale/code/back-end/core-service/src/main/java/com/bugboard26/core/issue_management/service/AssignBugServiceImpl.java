package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.service.HistoryService;
import com.bugboard26.core.issue_management.dto.AssignBug;
import com.bugboard26.core.issue_management.dto.IssueResponse;
import com.bugboard26.core.issue_management.event.BugAssignedEvent;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.shared.exception.UserNotFoundException;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.repository.IssueRepository;
import com.bugboard26.core.shared.repository.ReadOnlyUserRepository;
import com.bugboard26.core.issue_management.validator.AccessControlValidator;
import com.bugboard26.core.issue_management.validator.IssueDomainValidator;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Servizio isolato per l'assegnazione dei task (Funzionalità 4)[cite: 15].
 * Rispetta l'Interface Segregation Principle e orchestra il Command Layer in modo Event-Driven[cite: 16].
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

        // 2. Recupero l'entità Issue (se non esiste, il flusso si interrompe)
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue non trovata con ID: " + id));

        // 3. Verifica Invariante di Dominio: Posso assegnare solo segnalazioni di tipo BUG
        domainValidator.validateAssignable(issue);

        // 4. Verifica Esistenza Assegnatario in Read-Only (Loose Coupling)
        if (!userRepository.existsById(request.assigneeId())) {
            throw new UserNotFoundException("Utente assegnatario inesistente con ID: " + request.assigneeId());
        }

        // 5. Mutazione di Stato
        issue.setAssigneeId(request.assigneeId());
        Issue savedIssue = issueRepository.save(issue);

        Long currentAdminId = userProvider.getCurrentUserId();

        // 6. Registrazione SINCRONA e transazionale nell'History Subsystem
        historyService.recordEvent(
                savedIssue.getId(),
                currentAdminId,
                AuditAction.ASSIGNED,
                "Bug assegnato all'utente con ID: " + request.assigneeId()
        );

        // 7. Pubblicazione ASINCRONA dell'evento per il modulo Query & View (Notifiche)
        eventPublisher.publishEvent(new BugAssignedEvent(
                savedIssue.getId(),
                request.assigneeId(),
                LocalDateTime.now(ZoneId.systemDefault())
        ));

        // 8. Ritorno il DTO
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
