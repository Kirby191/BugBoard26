package com.bugboard26.auth.jwt;

import com.bugboard26.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider implements TokenProvider {

    // Shared secrety key per la firma dei token JWT.
    @Value("${jwt.secret:9a2f8c4e1b7d5a3f8e6c4b2a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e}")
    private String secretKey;

    @Value("${jwt.expiration-ms:86400000}") // 24 ore in millisecondi
    private long validityInMilliseconds;

    /**
     * Rispecchia la firma: +generateToken(user : User) : String da Auth.pdf
     */
    @Override
    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(validityInMilliseconds);

        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(user.getEmail()) // L'email rappresenta l'identificativo principale (subject)
                .claim("id", user.getId())
                .claim("username", user.getUsername())
                .claim("role", user.getRole().name()) // Salva il ruolo dell'utente nei claims
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry)) //Converte Instant in Date per compatibilità con JJWT
                .signWith(key) // In JJWT 0.12 l'algoritmo (HS256) viene dedotto in automatico dalla lunghezza della SecretKey
                .compact();
    }

    /**
     * Rispecchia la firma: +validateToken(token : String) : boolean da Auth.pdf
     */
    @Override
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

            // Sintassi aggiornata per JJWT 0.12.x
            Jwts.parser()
                    .verifyWith(key) // Sostituisce setSigningKey()
                    .build()
                    .parseSignedClaims(token); // Sostituisce parseClaimsJws()

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token scaduto, alterato o non valido
            return false;
        }
    }

    /**
     * Rispecchia la firma: +getEmailFromToken(token : String) : String da Auth.pdf
     */
    @Override
    public String getEmailFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        // Sintassi aggiornata per JJWT 0.12.x
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload(); // Sostituisce getBody()

        return claims.getSubject();
    }
}