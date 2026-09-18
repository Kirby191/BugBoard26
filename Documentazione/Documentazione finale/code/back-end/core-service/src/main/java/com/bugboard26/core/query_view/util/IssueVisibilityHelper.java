package com.bugboard26.core.query_view.util;

import com.bugboard26.core.issue_management.model.enums.IssueType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/**
 * Utility class per centralizzare le regole di visibilità.
 * Previene la duplicazione del codice tra i servizi del Query Layer.
 */
public final class IssueVisibilityHelper {

    private IssueVisibilityHelper() {
        // Nasconde il costruttore pubblico per le classi di utilità statica
    }

    /**
     * Genera il Predicate JPA per filtrare la visibilità delle Issue.
     * Gli utenti normali vedono tutte le issue generiche, ma solo i BUG a loro associati.
     */
    public static Predicate buildRbacPredicate(Root<?> root, CriteriaBuilder cb, Long currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return null; // Nessuna restrizione per gli admin
        }

        Predicate isNotBug = cb.notEqual(root.get("type"), IssueType.BUG);
        Predicate isReporter = cb.equal(root.get("reporterId"), currentUserId);
        Predicate isAssignee = cb.equal(root.get("assigneeId"), currentUserId);

        Predicate isMyBug = cb.and(
                cb.equal(root.get("type"), IssueType.BUG),
                cb.or(isReporter, isAssignee)
        );

        return cb.or(isNotBug, isMyBug);
    }
}
