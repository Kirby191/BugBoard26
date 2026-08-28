package com.bugboard26.core.query_view.repository;

import com.bugboard26.core.shared.model.UserReference;
import org.springframework.stereotype.Repository;

/**
 * Repository di sola lettura per estrarre la lista degli utenti.
 * Utilizzato dal Query Layer per popolare i menu a tendina (dropdown) del frontend.
 */
@Repository
public interface UserReadRepository extends ReadOnlyRepository<UserReference, Long> {
}
