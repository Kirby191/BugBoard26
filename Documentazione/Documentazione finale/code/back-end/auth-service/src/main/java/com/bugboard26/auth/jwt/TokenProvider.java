package com.bugboard26.auth.jwt;

import com.bugboard26.auth.model.User;

public interface TokenProvider {

    /**
     * Rispecchia: +generateToken(user : User) : String da Auth.pdf
     */
    String generateToken(User user);

    /**
     * Rispecchia: +validateToken(token : String) : boolean da Auth.pdf
     */
    boolean validateToken(String token);

    /**
     * Rispecchia: +getEmailFromToken(token : String) : String da Auth.pdf
     */
    String getEmailFromToken(String token);
}