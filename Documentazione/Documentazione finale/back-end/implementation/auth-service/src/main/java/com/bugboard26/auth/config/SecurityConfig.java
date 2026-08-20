package com.bugboard26.auth.config;

import com.bugboard26.auth.jwt.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Iniezione del filtro JWT definito nel diagramma Auth.pdf
    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * Rispecchia: +passwordEncoder() : PasswordEncoder da Auth.pdf
     * Utilizza BCrypt come definito nei vincoli architetturali del tuo progetto.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Rispecchia: +authenticationManager(config : AuthenticationConfiguration) : AuthenticationManager da Auth.pdf
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Rispecchia: +securityFilterChain(http : HttpSecurity) : SecurityFilterChain da Auth.pdf
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disabilitiamo il CSRF poiché usiamo i token JWT
                .csrf(csrf -> csrf.disable())
                // Impostiamo la gestione delle sessioni come STATELESS (nessuna sessione salvata su DB/Server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configuriamo le regole di autorizzazione
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll() // Endpoint pubblici del AuthController
                        .anyRequest().authenticated() // Tutte le altre richieste richiedono autenticazione
                )
                // Aggiungiamo il nostro JwtAuthFilter prima del filtro standard di Spring Security
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
