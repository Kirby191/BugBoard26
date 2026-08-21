package com.bugboard26.auth.config;

import com.bugboard26.auth.exception.InvalidCredentialsException;
import com.bugboard26.auth.jwt.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configurazione principale di Spring Security.
 * Fornisce i Bean infrastrutturali richiesti dall'UML (AuthenticationManager, PasswordEncoder)
 * e configura la catena di filtri per l'autenticazione stateless.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Iniezione del filtro JWT come modellato dalla relazione "..> configures >" nell'UML
    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * Rispecchia: +passwordEncoder() : PasswordEncoder
     * Espone l'algoritmo BCrypt richiesto dai vincoli di progetto.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Rispecchia: +authenticationManager(config : AuthenticationConfiguration) : AuthenticationManager
     * Estrae e rende disponibile il manager di autenticazione di Spring Security.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws InvalidCredentialsException {
        return config.getAuthenticationManager();
    }

    /**
     * Rispecchia: +securityFilterChain(http : HttpSecurity) : SecurityFilterChain
     * Configura la pipeline HTTP per garantire un'architettura rigorosamente stateless.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws InvalidCredentialsException {
        http
                // Disabilitiamo il CSRF (Cross-Site Request Forgery) perché usiamo token JWT, non cookie di sessione
                .csrf(AbstractHttpConfigurer::disable)

                // Impostiamo la gestione delle sessioni come STATELESS (nessuna sessione salvata sul server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configuriamo le regole di autorizzazione degli endpoint
                .authorizeHttpRequests(auth -> auth
                        // Consentiamo l'accesso pubblico
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        // Tutte le altre richieste richiedono un token valido
                        .anyRequest().authenticated()
                )

                // Inseriamo il nostro filtro JWT custom del filtro standard di Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
