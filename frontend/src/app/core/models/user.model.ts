export type Role = 'PATIENT' | 'MEDECIN' | 'SECRETAIRE' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: Role;
  enabled: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
}

export interface Patient extends User {
  dateNaissance?: string;
  adresse?: string;
  numeroSecuriteSociale?: string;
  groupeSanguin?: string;
  allergies?: string;
  antecedents?: string;
  parentId?: number;
}

export interface Medecin extends User {
  specialite: string;
  numeroOrdre?: string;
  description?: string;
  languesParlees?: string;
  tarifConsultation?: number;
  dureeConsultation?: number;
  horaires?: string;
  noteMoyenne?: number;
  nombreAvis?: number;
  cliniqueId?: number;
  cliniqueNom?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  requiresTwoFactor?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
  numeroSecuriteSociale?: string;
}
