package com.bugboard26.core.issue_management.validator;

import com.bugboard26.core.issue_management.exception.UnauthorizedActionException;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.stereotype.Component;

/** Centralizza i controlli di autorizzazione sulle operazioni di scrittura. */
@Component
public class AccessControlValidator {
    private final AuthenticatedUserProvider userProvider;

    public AccessControlValidator(AuthenticatedUserProvider userProvider) {
        this.userProvider = userProvider;
    }

    /** Verifica che l'utente possa modificare la segnalazione indicata. */
    public void canModifyIssue(Issue issue) {
        Long currentUserId = userProvider.getCurrentUserId();
        boolean isAdmin = userProvider.isCurrentAdmin();

        if (isAdmin) return;

        if (issue.getType() == IssueType.BUG) {
            if (!currentUserId.equals(issue.getAssigneeId())) {
                throw new UnauthorizedActionException("Accesso negato: puoi modificare solo i bug a te assegnati.");
            }
        } else {
            if (!currentUserId.equals(issue.getReporterId())) {
                throw new UnauthorizedActionException("Accesso negato: puoi modificare solo le segnalazioni da te create.");
            }
        }
    }

    /** Verifica che l'utente possa eliminare la segnalazione indicata. */
    public void canDeleteIssue(Issue issue) {
        Long currentUserId = userProvider.getCurrentUserId();
        boolean isAdmin = userProvider.isCurrentAdmin();

        if (isAdmin) return;

        if (!currentUserId.equals(issue.getReporterId())) {
            throw new UnauthorizedActionException("Accesso negato: puoi eliminare solo le segnalazioni da te create.");
        }
    }

    /** Verifica che l'utente corrente abbia il ruolo amministratore. */
    public void canManageProjects() {
        if (!userProvider.isCurrentAdmin()) {
            throw new UnauthorizedActionException("Accesso negato: operazione riservata agli Amministratori.");
        }
    }
}
