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
