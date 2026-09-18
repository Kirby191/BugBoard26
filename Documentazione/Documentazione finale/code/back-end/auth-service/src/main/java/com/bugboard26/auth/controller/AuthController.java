package com.bugboard26.auth.controller;

import com.bugboard26.auth.dto.JwtResponse;
import com.bugboard26.auth.dto.LoginRequest;
import com.bugboard26.auth.dto.UserRegistration;
import com.bugboard26.auth.dto.UserResponse;
import com.bugboard26.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST per l'autenticazione e la gestione degli utenti.
 */
@RestController
@RequestMapping("/api/auth")
/** Espone gli endpoint pubblici di login e registrazione. */
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint pubblico per il login degli utenti.
     * Risponde a POST /api/auth/login
     */
    @PostMapping("/login")
    /** Restituisce un token JWT dopo aver verificato le credenziali ricevute. */
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = userService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint pubblico per la registrazione di un nuovo utente.
     * Risponde a POST /api/auth/register
     */
    @PostMapping("/register")
    /** Registra un utente ordinario e restituisce HTTP 201. */
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRegistration request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
