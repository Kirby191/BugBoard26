package com.bugboard26.core.service;

import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.model.AuditRecord;
import com.bugboard26.core.history.repository.AuditRepository;
import com.bugboard26.core.history.service.HistoryServiceImpl;
import com.bugboard26.core.issue_management.dto.AssignBug;
import com.bugboard26.core.issue_management.dto.UpdateIssue;
import com.bugboard26.core.issue_management.event.BugAssignedEvent;
import com.bugboard26.core.issue_management.exception.InvalidIssueDomainException;
import com.bugboard26.core.shared.exception.IssueNotFoundException;
import com.bugboard26.core.issue_management.exception.UnauthorizedActionException;
import com.bugboard26.core.shared.exception.UserNotFoundException;
import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.repository.IssueRepository;
import com.bugboard26.core.issue_management.service.AssignBugServiceImpl;
import com.bugboard26.core.issue_management.service.IssueCommandServiceImpl;
import com.bugboard26.core.issue_management.validator.AccessControlValidator;
import com.bugboard26.core.issue_management.validator.IssueDomainValidator;
import com.bugboard26.core.shared.model.UserReference;
import com.bugboard26.core.issue_management.repository.ReadOnlyUserRepository;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnitTests {

    // ==========================================
    // MOCKS E INJECT MOCKS
    // ==========================================
    @Mock private IssueRepository issueRepository;
    @Mock private ReadOnlyUserRepository userRepository;
    @Mock private AccessControlValidator accessControlValidator;
    @Mock private IssueDomainValidator domainValidator;
    @Mock private HistoryServiceImpl historyService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private AuthenticatedUserProvider userProvider;
    @Mock private AuditRepository auditRepository;
    @Mock private EntityManager entityManager;

    @InjectMocks private AssignBugServiceImpl assignBugService;
    @InjectMocks private IssueCommandServiceImpl issueCommandService;
    @InjectMocks private HistoryServiceImpl historyServiceImpl;

    private Issue testBug;
    private Issue testFeature;

    @BeforeEach
    public void setup() {
        testBug = Issue.builder()
                .id(1L)
                .title("Test Bug")
                .type(IssueType.BUG)
                .status(IssueStatus.TODO)
                .projectId(10L)
                .reporterId(100L)
                .build();

        testFeature = Issue.builder()
                .id(2L)
                .title("Test Feature")
                .type(IssueType.FEATURE)
                .status(IssueStatus.TODO)
                .projectId(10L)
                .reporterId(100L)
                .build();
    }

    // ==========================================
    // METODO 1: assignBug (TC-01 -> TC-05)
    // ==========================================

    @Test
    @DisplayName("TC-01: assignBug - Successo con Admin, Bug e Assegnatario validi")
    public void testAssignBug_TC01() {
        AssignBug request = new AssignBug(200L);
        doNothing().when(accessControlValidator).canManageProjects();
        when(issueRepository.findById(1L)).thenReturn(Optional.of(testBug));
        when(userRepository.existsById(200L)).thenReturn(true);
        doNothing().when(domainValidator).validateAssignable(testBug);
        when(issueRepository.save(any(Issue.class))).thenReturn(testBug);
        when(userProvider.getCurrentUserId()).thenReturn(999L); // ID dell'Admin

        var response = assignBugService.assignBug(1L, request);

        assertNotNull(response);
        assertEquals(200L, testBug.getAssigneeId());
        verify(historyService, times(1)).recordEvent(eq(1L), eq(999L), eq(AuditAction.ASSIGNED), anyString());
        verify(eventPublisher, times(1)).publishEvent(any(BugAssignedEvent.class));
    }

    @Test
    @DisplayName("TC-02: assignBug - Fallimento per Dominio Invalido (Assegnazione Feature)")
    public void testAssignBug_TC02() {
        AssignBug request = new AssignBug(200L);
        doNothing().when(accessControlValidator).canManageProjects();
        when(issueRepository.findById(2L)).thenReturn(Optional.of(testFeature));
        doThrow(new InvalidIssueDomainException("Solo i BUG possono essere assegnati"))
                .when(domainValidator).validateAssignable(testFeature);

        assertThrows(InvalidIssueDomainException.class, () -> assignBugService.assignBug(2L, request));
        verify(issueRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-03: assignBug - Fallimento per Assegnatario Inesistente")
    public void testAssignBug_TC03() {
        AssignBug request = new AssignBug(888L); // ID inesistente
        doNothing().when(accessControlValidator).canManageProjects();
        when(issueRepository.findById(1L)).thenReturn(Optional.of(testBug));
        when(userRepository.existsById(888L)).thenReturn(false);

        assertThrows(UserNotFoundException.class, () -> assignBugService.assignBug(1L, request));
    }

    @Test
    @DisplayName("TC-04: assignBug - Fallimento per Utente Non Autorizzato (Role UTENTE)")
    public void testAssignBug_TC04() {
        AssignBug request = new AssignBug(200L);
        doThrow(new UnauthorizedActionException("Accesso Negato")).when(accessControlValidator).canManageProjects();

        assertThrows(UnauthorizedActionException.class, () -> assignBugService.assignBug(1L, request));
        verify(issueRepository, never()).findById(any());
    }

    @Test
    @DisplayName("TC-05: assignBug - Fallimento per Issue Inesistente")
    public void testAssignBug_TC05() {
        AssignBug request = new AssignBug(200L);
        doNothing().when(accessControlValidator).canManageProjects();
        when(issueRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IssueNotFoundException.class, () -> assignBugService.assignBug(999L, request));
    }

    // ==========================================
    // METODO 2: updateIssue (TC-06 -> TC-09)
    // ==========================================

    @Test
    @DisplayName("TC-06: updateIssue - Successo con cambio di stato (Genera STATUS_CHANGED)")
    public void testUpdateIssue_TC06() {
        UpdateIssue request = new UpdateIssue("Titolo", "Desc", IssueStatus.IN_PROGRESS, IssuePriority.HIGH);
        when(issueRepository.findById(1L)).thenReturn(Optional.of(testBug));
        doNothing().when(accessControlValidator).canModifyIssue(testBug);
        when(issueRepository.save(any(Issue.class))).thenReturn(testBug);
        when(userProvider.getCurrentUserId()).thenReturn(100L);

        issueCommandService.updateIssue(1L, request);

        assertEquals(IssueStatus.IN_PROGRESS, testBug.getStatus());
        verify(historyService, times(1)).recordEvent(eq(1L), eq(100L), eq(AuditAction.STATUS_CHANGED), anyString());
    }

    @Test
    @DisplayName("TC-07: updateIssue - Successo senza cambio di stato (Genera UPDATED)")
    public void testUpdateIssue_TC07() {
        UpdateIssue request = new UpdateIssue("Nuovo Titolo", null, null, null);
        when(issueRepository.findById(1L)).thenReturn(Optional.of(testBug));
        doNothing().when(accessControlValidator).canModifyIssue(testBug);
        when(issueRepository.save(any(Issue.class))).thenReturn(testBug);
        when(userProvider.getCurrentUserId()).thenReturn(100L);

        issueCommandService.updateIssue(1L, request);

        assertEquals("Nuovo Titolo", testBug.getTitle());
        verify(historyService, times(1)).recordEvent(eq(1L), eq(100L), eq(AuditAction.UPDATED), anyString());
    }

    @Test
    @DisplayName("TC-08: updateIssue - Fallimento per Utente Non Autorizzato")
    public void testUpdateIssue_TC08() {
        UpdateIssue request = new UpdateIssue("Titolo", "Desc", IssueStatus.IN_PROGRESS, IssuePriority.HIGH);
        when(issueRepository.findById(1L)).thenReturn(Optional.of(testBug));
        doThrow(new UnauthorizedActionException("Accesso Negato")).when(accessControlValidator).canModifyIssue(testBug);

        assertThrows(UnauthorizedActionException.class, () -> issueCommandService.updateIssue(1L, request));
        verify(issueRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-09: updateIssue - Fallimento per Issue Inesistente")
    public void testUpdateIssue_TC09() {
        UpdateIssue request = new UpdateIssue("Titolo", "Desc", IssueStatus.IN_PROGRESS, IssuePriority.HIGH);
        when(issueRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IssueNotFoundException.class, () -> issueCommandService.updateIssue(999L, request));
    }

    // ==========================================
    // METODO 3: recordEvent (TC-10)
    // ==========================================

    @Test
    @DisplayName("TC-10: recordEvent - Successo salvataggio Audit Immutabile")
    public void testRecordEvent_TC10() {
        UserReference mockAuthor = new UserReference(100L, "test@test.com", "User", null);
        when(entityManager.getReference(UserReference.class, 100L)).thenReturn(mockAuthor);

        historyServiceImpl.recordEvent(1L, 100L, AuditAction.CREATED, "Dettaglio");

        verify(auditRepository, times(1)).save(any(AuditRecord.class));
    }
}
