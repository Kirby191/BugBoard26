package com.bugboard26.auth.config;

import com.bugboard26.auth.model.Role;
import com.bugboard26.auth.model.User;
import com.bugboard26.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Inizializzatore per l'account Amministratore di default.
 * Legge dinamicamente le credenziali dal file application.properties o dalle variabili d'ambiente.
 */
@Configuration
/** Crea l'account amministratore iniziale quando richiesto dalla configurazione. */
public class AdminAccountInitializer {

    private static final Logger logger = LoggerFactory.getLogger(AdminAccountInitializer.class);

    @Value("${app.default-admin.email}")
    private String adminEmail;

    @Value("${app.default-admin.username}")
    private String adminUsername;

    @Value("${app.default-admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initAdminAccount(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Il controllo rende l'inizializzazione idempotente ai riavvii.
            if (!userRepository.existsByEmail(adminEmail)) {

                User defaultAdmin = User.builder()
                        .email(adminEmail)
                        .username(adminUsername)
                        .passwordHash(passwordEncoder.encode(adminPassword))
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(defaultAdmin);
                logger.info("Account Amministratore di default creato con successo. Email configurata: {}", adminEmail);
            } else {
                logger.info("Account Amministratore di default '{}' già presente nel sistema.", adminEmail);
            }
        };
    }
}
