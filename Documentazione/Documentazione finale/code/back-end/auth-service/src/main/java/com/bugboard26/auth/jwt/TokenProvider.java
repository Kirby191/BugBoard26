package com.bugboard26.auth.jwt;

import com.bugboard26.auth.model.User;

/** Definisce le operazioni necessarie per creare e leggere token JWT. */
public interface TokenProvider {

    String generateToken(User user);

    boolean validateToken(String token);

    String getEmailFromToken(String token);
}