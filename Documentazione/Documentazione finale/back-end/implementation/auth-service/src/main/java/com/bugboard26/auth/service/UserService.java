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
     */
    JwtResponse authenticate(LoginRequest request);

    /**
     * Crea un nuovo utente nel sistema (registrazione).
     */
    UserResponse createUser(UserRegistration request);

    /**
     * Recupera un'entità User a partire dall'email.
     */
    User findByEmail(String email);
}