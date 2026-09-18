package com.bugboard26.core.issue_management.dto;

/**
 * Dati necessari per la creazione di un progetto.
 *
 * @param name nome univoco del progetto
 * @param description descrizione iniziale del progetto, eventualmente assente
 */
public record CreateProject(
    String name,
    String description
) {}
