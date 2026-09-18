package com.bugboard26.auth.service;

import com.bugboard26.auth.dto.JwtResponse;
import com.bugboard26.auth.dto.LoginRequest;
import com.bugboard26.auth.dto.UserRegistration;
import com.bugboard26.auth.dto.UserResponse;
import com.bugboard26.auth.exception.EmailAlreadyExistsException;
import com.bugboard26.auth.exception.InvalidCredentialsException;
import com.bugboard26.auth.jwt.TokenProvider;
import com.bugboard26.auth.model.Role;
import com.bugboard26.auth.model.User;
import com.bugboard26.auth.repository.UserRepository;
import jakarta.annotation.Nonnull;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Implementazione del servizio utente e integrazione nativa con Spring Security.
 */
@Service
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserServiceImpl(UserRepository userRepository,
                           TokenProvider tokenProvider,
                           @Lazy PasswordEncoder passwordEncoder,
                           @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Autentica un utente e genera il token JWT.
     */
    @Override
    public JwtResponse authenticate(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Credenziali non valide per l'email: " + request.email());
        }

        User user = findByEmail(request.email());

        String token = tokenProvider.generateToken(user);

        return new JwtResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole()
        );
    }

    /**
     * Crea un nuovo utente nel sistema (registrazione).
     */
    @Override
    public UserResponse createUser(UserRegistration request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("L'email " + request.email() + " è già in uso.");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .username(request.username())
            // Il ruolo inviato dal client non è attendibile: la registrazione pubblica crea utenti ordinari.
            .role(Role.UTENTE)
                .build();

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getCreatedAt()
        );
    }

    /**
     * Recupera un'entità User a partire dall'email.
     */
    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato con email: " + email));
    }

    /**
     * Metodo richiesto dall'interfaccia UserDetailsService di Spring Security.
     * Viene chiamato dal JwtAuthFilter per verificare l'utente.
     */
    @Override
    @Nonnull
    public UserDetails loadUserByUsername(@Nonnull String email) throws UsernameNotFoundException {
        User user = findByEmail(email);

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRole().name())
                .build();
    }
}
