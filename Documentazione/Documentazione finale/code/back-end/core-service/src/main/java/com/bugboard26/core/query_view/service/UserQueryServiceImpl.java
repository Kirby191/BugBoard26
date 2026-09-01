package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.UserReferenceDTO;
import com.bugboard26.core.query_view.repository.UserReadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementazione del servizio per l'estrazione in sola lettura degli utenti.
 */
@Service
public class UserQueryServiceImpl implements UserQueryService {

    private final UserReadRepository userRepository;

    public UserQueryServiceImpl(UserReadRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserReferenceDTO> getUsers() {
        // Interroga la vista read-only e converte l'entità di dominio nel DTO di visualizzazione
        return userRepository.findAll().stream()
                .map(user -> new UserReferenceDTO(
                        user.getId(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();
    }
}
