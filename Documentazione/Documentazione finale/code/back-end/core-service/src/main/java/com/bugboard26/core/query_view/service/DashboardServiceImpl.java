package com.bugboard26.core.query_view.service;

import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.query_view.dto.DashboardStats;
import com.bugboard26.core.query_view.repository.IssueReadRepository;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import com.bugboard26.core.query_view.util.IssueVisibilityHelper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/** Calcola le statistiche della dashboard rispettando la visibilità dell'utente. */
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
        /*
         * Tutti i contatori devono usare lo stesso utente e lo stesso ruolo:
         * mescolarli produrrebbe una dashboard internamente incoerente.
         */
        Long currentUserId = userProvider.getCurrentUserId();
        boolean isAdmin = userProvider.isCurrentAdmin();

        int todoCount = countByStatusForUser(IssueStatus.TODO, currentUserId, isAdmin);
        int inProgressCount = countByStatusForUser(IssueStatus.IN_PROGRESS, currentUserId, isAdmin);
        int doneCount = countByStatusForUser(IssueStatus.DONE, currentUserId, isAdmin);
        int totalIssues = todoCount + inProgressCount + doneCount;

        int criticalCount = countCriticalForUser(currentUserId, isAdmin);

        // La soglia include le scadenze dei prossimi sette giorni e quelle già superate.
        LocalDate targetDate = LocalDate.now(ZoneId.systemDefault()).plusDays(7);
        int overdueCount = (int) issueRepository.count((root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            preds.add(cb.lessThanOrEqualTo(root.get("dueDate"), targetDate));
            preds.add(cb.notEqual(root.get("status"), IssueStatus.DONE));

            Predicate rbacPredicate = IssueVisibilityHelper.buildRbacPredicate(root, cb, currentUserId, isAdmin);
            if (rbacPredicate != null) {
                preds.add(rbacPredicate);
            }

            return cb.and(preds.toArray(new Predicate[0]));
        });

        long assignedToMeLong = issueRepository.count((root, query, cb) ->
                cb.equal(root.get("assigneeId"), currentUserId));

        int unassignedBugCount = 0;
        if (isAdmin) {
            unassignedBugCount = issueRepository.countByTypeAndAssigneeIdIsNull(IssueType.BUG);
        }

        return new DashboardStats(
                totalIssues,
                todoCount,
                inProgressCount,
                doneCount,
                (short) assignedToMeLong,
                criticalCount,
                overdueCount,
                unassignedBugCount
        );
    }

    // =========================================================================
    // METODI PRIVATI DI UTILITÀ PER IL CONTEGGIO CON RBAC
    // =========================================================================

    private int countByStatusForUser(IssueStatus status, Long userId, boolean isAdmin) {
        return (int) issueRepository.count((root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            preds.add(cb.equal(root.get("status"), status));

            Predicate rbacPredicate = IssueVisibilityHelper.buildRbacPredicate(root, cb, userId, isAdmin);
            if (rbacPredicate != null) {
                preds.add(rbacPredicate);
            }
            return cb.and(preds.toArray(new Predicate[0]));
        });
    }

    private int countCriticalForUser(Long userId, boolean isAdmin) {
        return (int) issueRepository.count((root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();

            // Fissiamo il valore CRITICAL
            preds.add(cb.equal(root.get("priority"), IssuePriority.CRITICAL));

            Predicate rbacPredicate = IssueVisibilityHelper.buildRbacPredicate(root, cb, userId, isAdmin);
            if (rbacPredicate != null) {
                preds.add(rbacPredicate);
            }
            return cb.and(preds.toArray(new Predicate[0]));
        });
    }
}
