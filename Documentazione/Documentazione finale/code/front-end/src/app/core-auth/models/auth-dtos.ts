import { UserRole } from "../../shared/models/enums";
/**
 * DTO per la richiesta di Login.
 */
export interface LoginRequest {
  email: string;
  passwordHash: string;
}

/**
 * DTO di risposta con il Token JWT.
 */
export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

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