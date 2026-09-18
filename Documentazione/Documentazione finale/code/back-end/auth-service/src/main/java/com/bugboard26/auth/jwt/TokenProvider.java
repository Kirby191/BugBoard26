package com.bugboard26.auth.jwt;

import com.bugboard26.auth.model.User;

public interface TokenProvider {

    String generateToken(User user);

    boolean validateToken(String token);

    String getEmailFromToken(String token);
}