/* ============================================================
	VALORI CONDIVISI DEL DOMINIO
	============================================================
	Questi union type mantengono allineati form, servizi, template e API.
	============================================================ */

// Classificazione funzionale della segnalazione.
export type IssueType = 'BUG' | 'FEATURE' | 'QUESTION' | 'DOCUMENTATION';
// Stati ammessi dal workflow delle issue.
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
// Livelli usati sia nei filtri sia negli indicatori visivi.
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
// Ruoli applicativi usati dalle guardie e dai componenti.
export type UserRole = 'ADMIN' | 'UTENTE';
// Azioni registrate nello storico dei bug.
export type AuditAction = 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'DUE_DATE_CHANGED' | 'UPDATED';