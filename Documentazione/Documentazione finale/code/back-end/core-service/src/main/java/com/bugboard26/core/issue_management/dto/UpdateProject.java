package com.bugboard26.core.issue_management.dto;

/**
 * Valori modificabili di un progetto.
 *
 * Un campo nullo indica che il valore corrente deve essere mantenuto.
 *
 * @param name nuovo nome del progetto, se deve essere modificato
 * @param description nuova descrizione, se deve essere modificata
 */
public record UpdateProject(
        String name,
        String description
) {}
