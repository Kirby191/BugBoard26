/**
 * DTO solo per admin per la gestione progetti
 */
export interface CreateProject {
    name: string;
    description: string;
}

export interface UpdateProject {
    name: string;
    description: string;
}