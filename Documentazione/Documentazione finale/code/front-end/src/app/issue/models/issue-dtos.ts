import { IssueType, IssuePriority, IssueStatus, UserRole } from '../../shared/models/enums';

/**
 * DTO per la creazione di una nuova segnalazione
 */
export interface CreateIssue {
  projectId: number;
  title: string;
  description: string;
  type: IssueType;
  priority?: IssuePriority; // Opzionale
}

export interface UpdateIssue {
    title: string;
    description: string;
    status: IssueStatus;
    priority?: IssuePriority; // Opzionale
}
/**
 * DTO per l'assegnazione di un bug
 */
export interface AssignBug {
  assigneeId: number;
}

/**
 * DTO di risposta per le operazioni di mutazione
 */
export interface IssueResponse {
  id: number;
  projectId: number;
  title: string;
  status: IssueStatus;
  type: IssueType;
  priority?: IssuePriority; // Opzionale
  assigneeId?: number;      // Opzionale: se non assegnato arriva null/undefined
}