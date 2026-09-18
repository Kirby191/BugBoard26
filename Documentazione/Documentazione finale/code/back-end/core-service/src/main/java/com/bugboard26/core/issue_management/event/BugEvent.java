package com.bugboard26.core.issue_management.event;

import java.time.LocalDateTime;

/**
 * Interfaccia contrattuale per gli eventi di dominio relativi ai bug.
 * Applica l'Open/Closed Principle (OCP) garantendo che ogni evento applicativo
 * (presente o futuro) esponga sempre i dati minimi di tracciabilità.
 */
public interface BugEvent {

    Long bugId();

    LocalDateTime timestamp();

}
