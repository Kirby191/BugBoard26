package com.bugboard26.core.query_view.service;

import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.query_view.dto.IssueDetailed;
import com.bugboard26.core.query_view.dto.IssueFilter;
import com.bugboard26.core.query_view.dto.IssueSummary;
import com.bugboard26.core.query_view.repository.IssueReadRepository;
import com.bugboard26.core.query_view.repository.ProjectReadRepository;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.issue_management.model.Project;
import com.bugboard26.core.shared.model.UserReference;
import com.bugboard26.core.query_view.repository.UserReadRepository;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import com.bugboard26.core.query_view.util.IssueVisibilityHelper;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/** Costruisce le letture delle issue applicando filtri e regole di visibilità. */
@Service
public class IssueQueryServiceImpl implements IssueQueryService {

    private final IssueReadRepository issueRepository;
    private final ProjectReadRepository projectRepository;
    private final UserReadRepository userRepository;
    private final AuthenticatedUserProvider userProvider;

    public IssueQueryServiceImpl(IssueReadRepository issueRepository,
                                 ProjectReadRepository projectRepository,
                                 UserReadRepository userRepository,
                                 AuthenticatedUserProvider userProvider) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.userProvider = userProvider;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IssueSummary> searchIssues(IssueFilter filter, Pageable pageable) {
        // La specification concentra in una query componibile filtri e autorizzazioni.
        Specification<Issue> spec = createSpecification(filter);

        return issueRepository.findAll(spec, pageable).map(issue -> {
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
                    assigneeEmail,
                    issue.getAssigneeId(),
                    issue.getReporterId()
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public IssueDetailed getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Segnalazione non trovata: " + id));

        // Per i bug, il 404 evita di rivelare l'esistenza di segnalazioni non visibili.
        if (!userProvider.isCurrentAdmin() && issue.getType() == IssueType.BUG) {
            Long currentUserId = userProvider.getCurrentUserId();
            boolean isReporter = currentUserId.equals(issue.getReporterId());
            boolean isAssignee = currentUserId.equals(issue.getAssigneeId());

            if (!isReporter && !isAssignee) {
                throw new IssueNotFoundException("Segnalazione non trovata: " + id);
            }
        }

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
                issue.getReporterId(),
                issue.getAssigneeId(),
                issue.getCreatedAt()
        );
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    private String resolveProjectName(Long projectId) {
        if (projectId == null) return "Progetto Sconosciuto";
        return projectRepository.findById(projectId).map(Project::getName).orElse("Progetto Eliminato");
    }

    private String resolveUserEmail(Long userId) {
        if (userId == null) return "Non assegnato";
        return userRepository.findById(userId).map(UserReference::getEmail).orElse("Utente Rimosso");
    }

    /** Costruisce la query con il vincolo RBAC prima dei filtri scelti dall'utente. */
    private Specification<Issue> createSpecification(IssueFilter filter) {
        Long currentUserId = userProvider.getCurrentUserId();
        boolean isAdmin = userProvider.isCurrentAdmin();

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Predicate rbacPredicate = IssueVisibilityHelper.buildRbacPredicate(root, criteriaBuilder, currentUserId, isAdmin);
            applyFilters(filter, root, criteriaBuilder, rbacPredicate, predicates);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /** Aggiunge alla query solo i parametri valorizzati e validi. */
    private static void applyFilters(IssueFilter filter, Root<Issue> root, CriteriaBuilder criteriaBuilder, Predicate rbacPredicate, List<Predicate> predicates) {
        if (rbacPredicate != null) {
            predicates.add(rbacPredicate);
        }
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
            if (filter.assigneeId().equals(-1L)) {
                predicates.add(criteriaBuilder.isNull(root.get("assigneeId")));
            } else {
                predicates.add(criteriaBuilder.equal(root.get("assigneeId"), filter.assigneeId()));
            }
        }
        if (filter.titleQuery() != null && !filter.titleQuery().isBlank()) {
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    "%" + filter.titleQuery().toLowerCase() + "%"
            ));
        }
    }
}
