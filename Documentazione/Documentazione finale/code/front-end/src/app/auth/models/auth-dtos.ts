// ------------------------------------------------
// APP / AUTH / MODELS / AUTH DTOS
// ------------------------------------------------

import { UserRole } from "../../shared/models/enums";

/* ============================================================
  CONTRATTI DI AUTENTICAZIONE
  ============================================================
  I DTO distinguono i dati inviati al backend dalle risposte ricevute.
  ============================================================ */
export interface LoginRequest {
  email: string;
  password: string;
}




// Risposta del login: il token viene persistito dall'AuthService.
export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

// Payload per la creazione di un'utenza, disponibile solo agli amministratori.
export interface UserRegistration {
    email: string;
    password: string;
    username: string;
    role: UserRole;
}

export interface UserResponse {
    id: number;
    email: string;
    username: string;
    role: UserRole;
    createdAt: string;
}