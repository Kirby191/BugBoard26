package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.attachment.service.FileStorage;
import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.service.HistoryService;
import com.bugboard26.core.issue_management.dto.CreateIssue;
import com.bugboard26.core.issue_management.dto.IssueResponse;
import com.bugboard26.core.issue_management.dto.UpdateIssue;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.issue_management.model.Enums.IssueStatus;
import com.bugboard26.core.issue_management.model.Enums.IssueType;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.repository.IssueRepository;
import com.bugboard26.core.issue_management.validator.AccessControlValidator;
import com.bugboard26.core.issue_management.validator.IssueDomainValidator;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
public class IssueCommandServiceImpl implements IssueCommandService {

    private final IssueRepository issueRepository;
    private final FileStorage fileStorage;
    private final HistoryService historyService;
    private final AuthenticatedUserProvider userProvider;
    private final AccessControlValidator accessControlValidator;
    private final IssueDomainValidator domainValidator;

    public IssueCommandServiceImpl(IssueRepository issueRepository,
                                   FileStorage fileStorage,
                                   HistoryService historyService,
                                   AuthenticatedUserProvider userProvider,
                                   AccessControlValidator accessControlValidator,
                                   IssueDomainValidator domainValidator) {
        this.issueRepository = issueRepository;
        this.fileStorage = fileStorage;
        this.historyService = historyService;
        this.userProvider = userProvider;
        this.accessControlValidator = accessControlValidator;
        this.domainValidator = domainValidator;
    }

    @Override
    @Transactional
    public IssueResponse createIssue(CreateIssue request, MultipartFile file) {
        // 1. Validazione di Dominio
        domainValidator.validateProject(request.projectId());

        Long authorId = userProvider.getCurrentUserId();

        // 2. Deleghiamo il salvataggio del file e otteniamo l'URL
        String uploadedFileUrl = null;
        if (file != null && !file.isEmpty()) {
            uploadedFileUrl = fileStorage.storeFile(file);
        }

        // 3. Creazione Entità INCLUDENDO l'URL
        Issue issue = Issue.builder()
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .status(IssueStatus.TODO)
                .priority(request.priority())
                .projectId(request.projectId())
                .reporterId(authorId)
                .attachmentUrl(uploadedFileUrl)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        // 4. Record Eventuale History
        if (savedIssue.getType() == IssueType.BUG) {
            historyService.recordEvent(savedIssue.getId(), authorId, AuditAction.CREATED, "Nuovo Bug Creato");
        }

        return mapToResponse(savedIssue);
    }

    @Override
    @Transactional
    public IssueResponse updateIssue(Long id, UpdateIssue request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Segnalazione inesistente con ID: " + id));

        // 1. Controllo di Accesso
        accessControlValidator.canModifyIssue(issue);

        // 2. Verifica se è cambiato lo stato
        boolean isStatusChanged = request.status() != null && request.status() != issue.getStatus();
        IssueStatus oldStatus = issue.getStatus();

        // 3. Mutazione dei campi
        if (request.title() != null) issue.setTitle(request.title());
        if (request.description() != null) issue.setDescription(request.description());
        if (request.priority() != null) issue.setPriority(request.priority());
        if (request.status() != null) issue.setStatus(request.status());

        Issue savedIssue = issueRepository.save(issue);

        // 4. Registrazione History
        if (savedIssue.getType() == IssueType.BUG) {
            Long authorId = userProvider.getCurrentUserId();
            if (isStatusChanged) {
                historyService.recordEvent(savedIssue.getId(), authorId, AuditAction.STATUS_CHANGED,
                        "Stato modificato da " + oldStatus + " a " + savedIssue.getStatus());
            } else {
                historyService.recordEvent(savedIssue.getId(), authorId, AuditAction.UPDATED, "Dettagli Bug Aggiornati");
            }
        }

        return mapToResponse(savedIssue);
    }

    @Override
    @Transactional
    public IssueResponse setDueDate(Long id, LocalDate dueDate) {
        // 1. Solo l'Admin può impostare la data di scadenza
        accessControlValidator.canManageProjects();

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Segnalazione inesistente con ID: " + id));

        // 2. Validazione di Dominio sulla data
        domainValidator.validateDueDate(dueDate);

        issue.setDueDate(dueDate);
        Issue savedIssue = issueRepository.save(issue);

        // 3. Registrazione History
        if (savedIssue.getType() == IssueType.BUG) {
            historyService.recordEvent(savedIssue.getId(), userProvider.getCurrentUserId(),
                    AuditAction.DUE_DATE_CHANGED, "Scadenza impostata al: " + dueDate);
        }

        return mapToResponse(savedIssue);
    }

    // Metodo di utility privato per generare la IssueResponse
    private IssueResponse mapToResponse(Issue issue) {
        return new IssueResponse(
                issue.getId(),
                issue.getProjectId(),
                issue.getTitle(),
                issue.getStatus(),
                issue.getType(),
                issue.getPriority(),
                issue.getAssigneeId()
        );
    }
}
