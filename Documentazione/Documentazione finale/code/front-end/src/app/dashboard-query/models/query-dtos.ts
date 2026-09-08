import { IssueType, IssuePriority, IssueStatus, AuditAction, UserRole } from '../../shared/models/enums';

export interface BugHistory {
    id: number;
    bugId: number;
    timestamp: string;
    action: AuditAction;
    authorEmail: string;
    details: string;
}

export interface NotificationDTO {
    id: number;
    message: string;
    timestamp: string;
    isread: boolean;
}

export interface ProjectState {
    id: number;
    name: string;
    description: string;
    lastModified: string;
}

export interface DashboardStats {
    totalIssues: number;
    todoCount: number;
    inProgressCount: number;
    doneCount: number;
    assignedToMeCount: number;
    criticalCount: number;
    overdueCount: number;
    unassignedBugCount: number;
}

export interface IssueFilter {
    projectId?: number;
    status?: IssueStatus;
    type?: IssueType;
    priority?: IssuePriority;
    assigneeId?: number;
    titleQuery?: string;
    sortBy?: 'createdAt' | 'dueDate' | 'priority';
    sortDirection?: 'asc' | 'desc'; // dichiarate qui per limitato utilizzo nel progetto corrente.
}

export interface IssueSummary {
  id: number;
  title: string;
  status: IssueStatus;
  type: IssueType;
  priority?: IssuePriority;
  dueDate?: string;
  projectName: string;     
  assigneeEmail?: string;
}

/**
 * DTO completo per la visualizzazione di dettaglio
 */
export interface IssueDetailed {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  status: IssueStatus;
  type: IssueType;
  priority?: IssuePriority;
  dueDate?: string;
  attachmentUrl?: string; // Se presente un allegato
  creatorEmail: string;
  assigneeEmail?: string;
  createdAt: string;
}

export interface UserReference {
    id: number;
    email: string;
    role: UserRole;
}