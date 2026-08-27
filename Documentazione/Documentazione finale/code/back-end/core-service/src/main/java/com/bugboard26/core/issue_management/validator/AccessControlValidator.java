package com.bugboard26.core.issue_management.validator;

import com.bugboard26.core.issue_management.exception.UnauthorizedActionException;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.stereotype.Component;

/**
 * Componente dedicato esclusivamente alla valutazione delle regole RBAC.
 * Isola i controlli di sicurezza dalla logica di business dei Service (Funzionalità 9)[cite: 4, 8].
 */
@Component
public class AccessControlValidator {

    private final AuthenticatedUserProvider userProvider;

    public AccessControlValidator(AuthenticatedUserProvider userProvider) {
        this.userProvider = userProvider;
    }

    /**
     * Verifica che l'utente corrente abbia i privilegi per modificare la Issue.
     * Regola: Modifica consentita solo all'autore (Reporter) o a un Amministratore[cite: 4, 8].
     *
     * @param issue La segnalazione che si intende modificare.
     * @throws UnauthorizedActionException Se i permessi sono insufficienti.
     */
    public void canModifyIssue(Issue issue) {
        Long currentUserId = userProvider.getCurrentUserId();
        boolean isAdmin = userProvider.isCurrentAdmin();

        if (!isAdmin && !currentUserId.equals(issue.getReporterId())) {
            throw new UnauthorizedActionException("Accesso negato: non hai i privilegi per modificare questa segnalazione.");
        }
    }

    /**
     * Verifica che l'operazione in corso sia eseguita da un Amministratore.
     * Utilizzato per l'assegnazione dei task o la gestione dei progetti[cite: 4].
     *
     * @throws UnauthorizedActionException Se l'utente non è un Amministratore.
     */
    public void canManageProjects() {
        if (!userProvider.isCurrentAdmin()) {
            throw new UnauthorizedActionException("Accesso negato: operazione riservata agli Amministratori.");
        }
    }
}
