package com.bugboard26.core.query_view.repository;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interfaccia base personalizzata per il Query Layer (CQRS).
 * Estende l'interfaccia radice 'Repository' di Spring (che è vuota)
 * esponendo ESCLUSIVAMENTE metodi di lettura.
 * L'annotazione @NoRepositoryBean impedisce a Spring di istanziarla direttamente.
 */
@NoRepositoryBean
public interface ReadOnlyRepository<T, ID> extends Repository<T, ID> {

    Optional<T> findById(ID id);

    List<T> findAll();

    // NOTE: Nessun metodo save(), delete() o update() è presente.
    // Garantisce fisicamente l'impossibilità di alterare il dominio dalla Dashboard.
}
