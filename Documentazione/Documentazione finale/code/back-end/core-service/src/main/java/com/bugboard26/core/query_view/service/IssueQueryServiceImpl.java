package com.bugboard26.core.query_view.service;

import com.bugboard26.core.history.dto.BugHistory;
import com.bugboard26.core.history.service.HistoryService;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.query_view.dto.IssueDetailed;
import com.bugboard26.core.query_view.dto.IssueFilter;
import com.bugboard26.core.query_view.dto.IssueSummary;
import com.bugboard26.core.query_view.repository.IssueReadRepository;
import com.bugboard26.core.query_view.repository.ProjectReadRepository;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.issue_management.model.Project;
import com.bugboard26.core.shared.model.UserReference;
import com.bugboard26.core.shared.repository.ReadOnlyUserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class IssueQueryServiceImpl implements IssueQueryService {

    private final IssueReadRepository issueRepository;
    private final ProjectReadRepository projectRepository;
    private final ReadOnlyUserRepository userRepository;
    private final HistoryService historyService;;

    public IssueQueryServiceImpl(IssueReadRepository issueRepository,
                                 ProjectReadRepository projectRepository,
                                 ReadOnlyUserRepository userRepository,
                                 HistoryService historyService) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.historyService = historyService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummary> searchIssues(IssueFilter filter, Pageable pageable) {
        Specification<Issue> spec = createSpecification(filter);

        return issueRepository.findAll(spec, pageable).map(issue -> {
            // Risolviamo i nomi per la visualizzazione leggera (Summary)
            String projectName = resolveProjectName(issue.getProjectId());
            String assigneeEmail = resolveUserEmail(issue.getAssigneeId());

            return new IssueSummary(
                    issue.getId(),
                    issue.getTitle(),
                    issue.getStatus(),
                    issue.getType(),
                    issue.getPriority(),
                    issue.getDueDate(),
                    projectName,
                    assigneeEmail
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public IssueDetailed getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Segnalazione non trovata: " + id));

        // Risolviamo i metadati pesanti in lettura (CQRS Pattern)
        String projectName = resolveProjectName(issue.getProjectId());
        String creatorEmail = resolveUserEmail(issue.getReporterId());
        String assigneeEmail = resolveUserEmail(issue.getAssigneeId());
        String attachmentUrl = issue.getAttachmentUrl();

        return new IssueDetailed(
                issue.getId(),
                issue.getProjectId(),
                projectName,
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                issue.getType(),
                issue.getPriority(),
                issue.getDueDate(),
                attachmentUrl,
                creatorEmail,
                assigneeEmail,
                issue.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BugHistory> getBugHistory(Long issueId) {
        // Pass-through verso il sottosistema History (UML Requirement)
        return historyService.getHistoryForBug(issueId);
    }

    // =========================================================================
    // UTILITY METHODS (Risoluzione Loose Coupling & Filtri Dinamici)
    // =========================================================================

    private String resolveProjectName(Long projectId) {
        if (projectId == null) return "Progetto Sconosciuto";
        return projectRepository.findById(projectId).map(Project::getName).orElse("Progetto Eliminato");
    }

    private String resolveUserEmail(Long userId) {
        if (userId == null) return "Non assegnato";
        return userRepository.findById(userId).map(UserReference::getEmail).orElse("Utente Rimosso");
    }

    /**
     * Trasforma l'IssueFilter in query SQL dinamica tramite Criteria API di Spring Data JPA.
     */
    private Specification<Issue> createSpecification(IssueFilter filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.projectId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("projectId"), filter.projectId()));
            }
            if (filter.status() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filter.status()));
            }
            if (filter.type() != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), filter.type()));
            }
            if (filter.priority() != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), filter.priority()));
            }
            if (filter.assigneeId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("assigneeId"), filter.assigneeId()));
            }
            if (filter.titleQuery() != null && !filter.titleQuery().isBlank()) {
                // Ricerca case-insensitive
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + filter.titleQuery().toLowerCase() + "%"
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
