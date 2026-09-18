package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.attachment.service.FileStorage;
import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.service.HistoryService;
import com.bugboard26.core.issue_management.dto.CreateIssue;
import com.bugboard26.core.issue_management.dto.IssueResponse;
import com.bugboard26.core.issue_management.dto.UpdateIssue;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.repository.IssueRepository;
import com.bugboard26.core.issue_management.validator.AccessControlValidator;
import com.bugboard26.core.issue_management.validator.IssueDomainValidator;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

/** Coordina le mutazioni delle issue, gli allegati e la registrazione della cronologia. */
@Service
public class IssueCommandServiceImpl implements IssueCommandService {

    public static final String INESISTENTE_CON_ID = "Segnalazione inesistente con ID: ";

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
        /*
         * La issue viene salvata prima dell'allegato perché il suo identificativo
         * persistito viene usato dal provider per costruire il percorso del file.
         */
        domainValidator.validateProject(request.projectId());

        Long authorId = userProvider.getCurrentUserId();

        Issue issue = Issue.builder()
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .status(IssueStatus.TODO)
                .priority(request.priority())
                .projectId(request.projectId())
                .reporterId(authorId)
                .build();

        Issue savedIssue = issueRepository.save(issue);

        if (file != null && !file.isEmpty()) {
            String uploadedFileUrl = fileStorage.storeFile(savedIssue.getId(), file);
            savedIssue.setAttachmentUrl(uploadedFileUrl);
            savedIssue = issueRepository.save(savedIssue);
        }

        if (savedIssue.getType() == IssueType.BUG) {
            historyService.recordEvent(savedIssue.getId(), authorId, AuditAction.CREATED, "Nuovo Bug Creato");
        }

        return mapToResponse(savedIssue);
    }

    /**
     * Aggiorna una issue esistente.
     *
     * @param id      L'ID della issue da aggiornare
     * @param request I dati per l'aggiornamento
     * @param file    L'eventuale file allegato
     * @return La issue aggiornata
     */
    @Override
    @Transactional
    public IssueResponse updateIssue(Long id, UpdateIssue request, MultipartFile file) {
        /*
         * L'ordine è intenzionale: prima si verifica la risorsa e il permesso,
         * poi si raccolgono le mutazioni per produrre un audit leggibile.
         */
    Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new IssueNotFoundException(INESISTENTE_CON_ID + id));

    accessControlValidator.canModifyIssue(issue);

    boolean isStatusChanged = request.status() != null && request.status() != issue.getStatus();
    IssueStatus oldStatus = issue.getStatus();
    java.util.StringJoiner details = new java.util.StringJoiner(" | ");

    processAttachmentUpdate(issue, file, details);
    applyFieldMutations(issue, request, details);

    Issue savedIssue = issueRepository.save(issue);

    recordHistoryIfBug(savedIssue, isStatusChanged, oldStatus, details);

    return mapToResponse(savedIssue);
}

    @Override
    @Transactional
    public IssueResponse setDueDate(Long id, LocalDate dueDate) {
        // La modifica della scadenza è riservata agli amministratori.
        accessControlValidator.canManageProjects();
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException(INESISTENTE_CON_ID + id));

        LocalDate oldDate = issue.getDueDate();

        if (!java.util.Objects.equals(oldDate, dueDate)) {
            
            domainValidator.validateDueDate(dueDate);
            issue.setDueDate(dueDate);
            Issue savedIssue = issueRepository.save(issue);

            if (savedIssue.getType() == IssueType.BUG) {
                String oldD = oldDate == null ? "N/A" : oldDate.toString();
                String newD = dueDate == null ? "N/A" : dueDate.toString();
                historyService.recordEvent(savedIssue.getId(), userProvider.getCurrentUserId(),
                        AuditAction.DUE_DATE_CHANGED, "Scadenza: " + oldD + " -> " + newD);
            }
            return mapToResponse(savedIssue);
        }

        // Evita una scrittura quando la scadenza non è cambiata.
        return mapToResponse(issue);
    }

    @Override
    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException(INESISTENTE_CON_ID + id));

        accessControlValidator.canDeleteIssue(issue);
        issueRepository.delete(issue);
    }

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

    private void processAttachmentUpdate(Issue issue, MultipartFile file, java.util.StringJoiner details) {
        if (file != null && !file.isEmpty()) {
            String newFileUrl = fileStorage.storeFile(issue.getId(), file);
            issue.setAttachmentUrl(newFileUrl);
            details.add("Allegato: Aggiornato");
        }
    }

    private void applyFieldMutations(Issue issue, UpdateIssue request, java.util.StringJoiner details) {
        if (request.title() != null && !request.title().equals(issue.getTitle())) {
            details.add("Titolo: '" + issue.getTitle() + "' -> '" + request.title() + "'");
            issue.setTitle(request.title());
        }

        if (request.description() != null && !request.description().equals(issue.getDescription())) {
            details.add("Descrizione: Aggiornata");
            issue.setDescription(request.description());
        }

        if (request.priority() != issue.getPriority()) {
            String oldPrio = issue.getPriority() == null ? "N/A" : issue.getPriority().name();
            String newPrio = request.priority() == null ? "N/A" : request.priority().name();
            details.add("Priorità: " + oldPrio + " -> " + newPrio);
            issue.setPriority(request.priority());
        }

        if (request.status() != null) {
            issue.setStatus(request.status());
        }
    }

    private void recordHistoryIfBug(Issue savedIssue, boolean isStatusChanged, IssueStatus oldStatus, java.util.StringJoiner details) {
        /*
         * La cronologia è una regola specifica dei BUG: le altre tipologie
         * condividono le mutazioni ma non generano eventi audit.
         */
        if (savedIssue.getType() == IssueType.BUG) {
            Long authorId = userProvider.getCurrentUserId();

            if (isStatusChanged) {
                historyService.recordEvent(savedIssue.getId(), authorId, AuditAction.STATUS_CHANGED,
                        "Stato modificato da " + oldStatus + " a " + savedIssue.getStatus());
            } else if (details.length() > 0) {
                // Genera l'evento SOLO se c'è stato un effettivo cambiamento nei dettagli
                historyService.recordEvent(savedIssue.getId(), authorId, AuditAction.UPDATED, details.toString());
            }
        }
    }
}
