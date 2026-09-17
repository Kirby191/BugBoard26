/* ============================================================
  DTO DELLE OPERAZIONI ISSUE
  ============================================================
  Questi contratti descrivono i payload del Command layer e non
  coincidono necessariamente con i modelli usati nelle query.
  ============================================================ */

import { IssueType, IssuePriority, IssueStatus, UserRole } from '../../shared/models/enums';




// Payload completo usato dalla creazione multipart.
export interface CreateIssue {
  projectId: number;
  title: string;
  description: string;
  type: IssueType;
  priority?: IssuePriority; 
}

// Campi modificabili dopo la creazione della issue.
export interface UpdateIssue {
    title: string;
    description: string;
    status: IssueStatus;
    priority?: IssuePriority; 
}



// Payload dedicato all'assegnazione o rimozione dell'assegnatario.
export interface AssignBug {
  assigneeId: number | null; 
}




export interface IssueResponse {
  id: number;
  projectId: number;
  title: string;
  status: IssueStatus;
  type: IssueType;
  priority?: IssuePriority; 
  assigneeId?: number;      
}