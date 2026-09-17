/* ============================================================
  DTO CONDIVISI
  ============================================================
  Contiene le forme minime usate da gestione errori e progetti.
  ============================================================ */

// Forma standard degli errori restituiti dai servizi HTTP.
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}




// Rappresentazione di sola lettura usata da liste, form e dettaglio progetto.
export interface ProjectState {
    id: number;
    name: string;
    description: string;
    lastModified: string;
}