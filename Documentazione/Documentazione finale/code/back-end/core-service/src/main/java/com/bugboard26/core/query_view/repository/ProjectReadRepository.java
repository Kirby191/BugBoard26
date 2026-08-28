package com.bugboard26.core.query_view.repository;

import com.bugboard26.core.issue_management.model.Project;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository di sola lettura per i progetti.
 */
@Repository
public interface ProjectReadRepository extends ReadOnlyRepository<Project, Long> {

    /**
     * Recupera tutti i progetti ordinati dal modificato più di recente.
     */
    List<Project> findAllByOrderByUpdatedAtDesc();

}
