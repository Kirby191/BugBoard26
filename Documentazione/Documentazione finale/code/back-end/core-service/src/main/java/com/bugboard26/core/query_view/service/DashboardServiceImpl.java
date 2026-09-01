package com.bugboard26.core.query_view.service;

import com.bugboard26.core.issue_management.model.Enums.IssuePriority;
import com.bugboard26.core.issue_management.model.Enums.IssueStatus;
import com.bugboard26.core.issue_management.model.Enums.IssueType;
import com.bugboard26.core.query_view.dto.DashboardStats;
import com.bugboard26.core.query_view.repository.IssueReadRepository;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Implementazione del Query Layer per il calcolo delle metriche della Dashboard.
 * Applica le regole RBAC per segmentare le viste tra Admin e Utente.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private final IssueReadRepository issueRepository;
    private final AuthenticatedUserProvider userProvider;

    public DashboardServiceImpl(IssueReadRepository issueRepository,
                                AuthenticatedUserProvider userProvider) {
        this.issueRepository = issueRepository;
        this.userProvider = userProvider;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        // 1. Calcolo metriche globali tramite conteggi ottimizzati a DB
        int todoCount = issueRepository.countByStatus(IssueStatus.TODO);
        int inProgressCount = issueRepository.countByStatus(IssueStatus.IN_PROGRESS);
        int doneCount = issueRepository.countByStatus(IssueStatus.DONE);
        int totalIssues = todoCount + inProgressCount + doneCount;

        int criticalCount = issueRepository.countByPriority(IssuePriority.CRITICAL);

        // Calcola quante segnalazioni sono scadute e non ancora completate
        int overdueCount = issueRepository.countByDueDateBeforeAndStatusNot(LocalDate.now(ZoneId.systemDefault()), IssueStatus.DONE);

        // 2. Metriche Sensibili al Contesto (RBAC & Identità)
        Long currentUserId = userProvider.getCurrentUserId();

        // Uso JpaSpecificationExecutor per calcolare i task assegnati senza toccare il Repository base
        long assignedToMeLong = issueRepository.count((root, query, cb) ->
                cb.equal(root.get("assigneeId"), currentUserId));

        int unassignedBugCount = 0;

        // Se l'utente è Admin, calcoliamo anche i bug non assegnati da smistare
        if (userProvider.isCurrentAdmin()) {
            unassignedBugCount = issueRepository.countByTypeAndAssigneeIdIsNull(IssueType.BUG);
        }

        // 3. Generazione DTO finale[cite: 4]
        return new DashboardStats(
                totalIssues,
                todoCount,
                inProgressCount,
                doneCount,
                (short) assignedToMeLong, // Il cast a short ottimizza il payload
                criticalCount,
                overdueCount,
                unassignedBugCount
        );
    }
}
