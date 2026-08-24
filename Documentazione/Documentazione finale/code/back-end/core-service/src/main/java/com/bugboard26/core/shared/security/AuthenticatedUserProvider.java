package com.bugboard26.core.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Componente che astrae l'accesso al SecurityContextHolder.
 * Permette ai vari subsystems di ottenere l'utente corrente
 * senza accoppiare la business logic alle classi statiche del framework di sicurezza.
 */
@Component
public class AuthenticatedUserProvider {

    /**
     * Recupera l'ID dell'utente attualmente loggato.
     * @return Long rappresentante l'ID utente.
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Verifica la presenza dell'autenticazione e che il Principal sia effettivamente l'ID (Long)
        // come impostato nel nostro JwtAuthenticationFilter
        if (authentication != null && authentication.getPrincipal() instanceof Long userId) {
            return userId;
        }

        throw new IllegalStateException("Utente non autenticato o Principal non valido nel SecurityContext");
    }

    /**
     * Recupera il ruolo dell'utente attualmente loggato.
     * @return String rappresentante il ruolo (es. "ROLE_ADMIN" o "ROLE_UTENTE").
     */
    public String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null) {
            authentication.getAuthorities();
            if (!authentication.getAuthorities().isEmpty()) {
                // Estrae la prima authority. Nel nostro design l'utente ha un solo ruolo.
                return authentication.getAuthorities().iterator().next().getAuthority();
            }
        }

        throw new IllegalStateException("Ruolo non trovato per l'utente corrente nel SecurityContext");
    }

    /**
     * Verifica in modo rapido se l'utente corrente possiede privilegi amministrativi.
     * Metodo di utility per le logiche RBAC (Funzionalità 9).
     * @return true se l'utente è un amministratore, false altrimenti.
     */
    public boolean isCurrentAdmin() {
        return "ROLE_ADMIN".equals(getCurrentUserRole());
    }
}
