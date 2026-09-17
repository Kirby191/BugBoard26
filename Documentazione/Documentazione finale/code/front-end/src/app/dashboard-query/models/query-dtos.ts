// ---------------------------------------------------
// APP / DASHBOARD QUERY / MODELS / QUERY DTOS
// ---------------------------------------------------

import { IssueType, IssuePriority, IssueStatus, AuditAction, UserRole } from '../../shared/models/enums';

/* ============================================================
    MODELLI DEL QUERY LAYER
    ============================================================
    I modelli separano i dati ottimizzati per liste e dashboard
    dal dettaglio completo delle singole issue.
    ============================================================ */
export interface BugHistory {
    id: number;
    bugId: number;
    timestamp: string;
    action: AuditAction;
    authorEmail: string;
    details: string;
}

// Notifica persistente o ricevuta tramite stream live.
export interface NotificationDTO {
    id: number;
    message: string;
    timestamp: string;
    isRead: boolean;
}

// Contatori già aggregati dal backend per le card della dashboard.
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

// Filtri inviabili all'endpoint di ricerca delle issue.
export interface IssueFilter {
    projectId?: number;
    status?: IssueStatus;
    type?: IssueType;
    priority?: IssuePriority;
    assigneeId?: number;
    titleQuery?: string;
    sortBy?: 'createdAt' | 'dueDate' | 'priority';
    sortDirection?: 'asc' | 'desc'; 
}

// Payload leggero per tabelle e liste.
export interface IssueSummary {
  id: number;
  title: string;
  status: IssueStatus;
  type: IssueType;
  priority?: IssuePriority;
  dueDate?: string;
  projectName: string;     
  assigneeEmail?: string;
  reporterId?: number; 
  assigneeId?: number;
}




// Payload completo per dettaglio, modifica e storico.
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
  attachmentUrl?: string; 
  creatorEmail: string;
  assigneeEmail?: string;
  assigneeId?: number;
  reporterId?: number;
  createdAt: string;
}

export interface UserReference {
    id: number;
    email: string;
    role: UserRole;
}