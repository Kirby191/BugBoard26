package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.repository.ProjectReadRepository;
import com.bugboard26.core.shared.dto.ProjectState;
import com.bugboard26.core.shared.exception.ProjectNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectQueryServiceImpl implements ProjectQueryService {

    private final ProjectReadRepository projectRepository;

    public ProjectQueryServiceImpl(ProjectReadRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional(readOnly = true) // Disabilita il dirty checking, risparmia RAM
    public List<ProjectState> getProjects() {
        // Eroga tutti i progetti ordinati per ultima modifica (metodo custom)
        return projectRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(p -> new ProjectState(p.getId(), p.getName(), p.getDescription(), p.getUpdatedAt()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectState getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(p -> new ProjectState(p.getId(), p.getName(), p.getDescription(), p.getUpdatedAt()))
                .orElseThrow(() -> new ProjectNotFoundException("Id progetto: " + id + " non trovato nel Query Layer."));
    }
}
