package com.bugboard26.auth.service;

import com.bugboard26.auth.dto.JwtResponse;
import com.bugboard26.auth.dto.LoginRequest;
import com.bugboard26.auth.dto.UserRegistration;
import com.bugboard26.auth.dto.UserResponse;
import com.bugboard26.auth.model.User;

/**
 * Interfaccia del servizio utente.
 * Disaccoppia i controller dalla logica di business.
 */
public interface UserService {

    /**
     * Autentica un utente e genera il token JWT.
     *
     * @param request credenziali ricevute dal client
     * @return token e dati pubblici dell'utente
     */
    JwtResponse authenticate(LoginRequest request);

    /**
     * Registra un utente ordinario dopo aver verificato l'unicità dell'email.
     *
     * @param request dati della registrazione
     * @return dati pubblici dell'utente persistito
     */
    UserResponse createUser(UserRegistration request);

    /** Recupera l'utente associato all'email o segnala che non esiste. */
    User findByEmail(String email);
}