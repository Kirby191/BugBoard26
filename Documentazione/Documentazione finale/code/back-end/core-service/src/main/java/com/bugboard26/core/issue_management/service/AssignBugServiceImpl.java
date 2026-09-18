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
 * Coordina assegnazione, audit e notifiche delle segnalazioni.
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
        accessControlValidator.canManageProjects();

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue non trovata con ID: " + id));

        domainValidator.validateAssignable(issue);

        Long newAssigneeId = request.assigneeId();
        Long currentAdminId = userProvider.getCurrentUserId();

        // Nessun cambio significa nessun audit e nessuna notifica.
        if (java.util.Objects.equals(issue.getAssigneeId(), newAssigneeId)) {
            return buildResponse(issue);
        }

        if (newAssigneeId == null) {
        Long previousAssigneeId = issue.getAssigneeId();
        issue.setAssigneeId(null);
        Issue savedIssue = issueRepository.save(issue);

        historyService.recordEvent(savedIssue.getId(), currentAdminId, AuditAction.ASSIGNED, "L'amministratore ha rimosso l'assegnazione del task.");

        if (previousAssigneeId != null) {
            eventPublisher.publishEvent(new BugUnassignedEvent(
                    savedIssue.getId(),
                    previousAssigneeId,
                    LocalDateTime.now(ZoneId.systemDefault())
            ));
        }
        return buildResponse(savedIssue);
    }

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

        eventPublisher.publishEvent(new BugAssignedEvent(
                savedIssue.getId(),
                newAssigneeId,
                LocalDateTime.now(ZoneId.systemDefault())
        ));

        return buildResponse(savedIssue);
    }

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
