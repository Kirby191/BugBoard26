/* ============================================================
    DTO DELLE OPERAZIONI PROGETTO
    ============================================================
    Separano il payload di creazione da quello di aggiornamento.
    ============================================================ */

// Payload usato dall'endpoint POST.
export interface CreateProject {
    name: string;
    description: string;
}

// Payload usato dall'endpoint PUT.
export interface UpdateProject {
    name: string;
    description: string;
}