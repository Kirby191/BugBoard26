package com.bugboard26.core.shared.security;

import com.bugboard26.core.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

/**
 * Filtro di sicurezza per il core-service.
 * Intercetta ogni richiesta HTTP, valida la firma del token JWT in locale
 * e popola il SecurityContextHolder.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProperties jwtProperties;

    // Iniezione diretta delle proprietà configurate in application.properties
    public JwtAuthenticationFilter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Controlla la presenza dell'header Authorization: Bearer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            // 2. Genera la chiave segreta basandosi sulla stringa condivisa
            SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));

            // 3. Valida la firma del token JWT ed estrae il payload
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 4. Estrazione dei dati precedentemente inseriti dall'auth-service
            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            Long userId = claims.get("id", Long.class);

            // 5. Se il token è valido e il contesto di Spring è vuoto, autentica la richiesta
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Crea i permessi RBAC (Spring richiede solitamente il prefisso "ROLE_")
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                // Usa l'ID utente come "Principal" affinché l'AuthenticatedUserProvider possa leggerlo
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        Collections.singletonList(authority)
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Popola il SecurityContextHolder come previsto dal diagramma UML
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (JwtException | IllegalArgumentException ex) {
            // La gestione in log permette alla SecurityFilterChain di bloccare la richiesta
            logger.error("Firma JWT non valida o token alterato", ex);
        }

        filterChain.doFilter(request, response);
    }
}
