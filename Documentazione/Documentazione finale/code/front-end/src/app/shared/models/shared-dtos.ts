/**
 * Interfaccia per la formattazione standardizzata degli errori REST (400, 401, 403, 404, 500).
 * Fondamentale per l'ErrorInterceptor.
 */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
/**
 * Interfaccia per la rappresentazione dello stato di un progetto.
 * Fondamentale per la visualizzazione della lista e per la gestione dei progetti.
 */
export interface ProjectState {
    id: number;
    name: string;
    description: string;
    lastModified: string;
}