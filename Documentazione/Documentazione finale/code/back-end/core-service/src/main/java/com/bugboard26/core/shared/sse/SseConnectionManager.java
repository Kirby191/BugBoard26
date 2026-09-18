package com.bugboard26.core.shared.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gestore generico per le connessioni Server-Sent Events (SSE).
 * Collocato nel modulo Shared per favorire il riuso in futuri contesti real-time.
 */
@Component
public class SseConnectionManager {

    // Mappa thread-safe per mantenere le connessioni attive degli utenti (K: UserId, V: Emitter)
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createConnection(Long userId) {
        // Timeout impostato a 30 minuti (1.800.000 ms).
        SseEmitter emitter = new SseEmitter(1800000L);
        emitters.put(userId, emitter);

        // Pulizia automatica delle risorse in caso di disconnessione
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        return emitter;
    }

    /**
     * Invia un payload generico (es. NotificationDTO) all'utente specificato, se è online.
     */
    public void pushToUser(Long userId, Object payload) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(payload));
            } catch (IOException e) {
                emitters.remove(userId); // Rimuove connessioni "appese"
            }
        }
    }
}
