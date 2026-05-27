export interface Consultation {
  id: number;
  appointmentId?: number;
  patientId: number;
  patientNom: string;
  medecinId: number;
  medecinNom: string;
  motif?: string;
  symptomes?: string;
  diagnostic?: string;
  compteRendu?: string;
  recommandations?: string;
  dateConsultation: string;
  prescriptions: Prescription[];
}

export interface Prescription {
  id?: number;
  consultationId?: number;
  patientId: number;
  patientNom?: string;
  medecinId: number;
  medecinNom?: string;
  medicament: string;
  dosage: string;
  frequence: string;
  dureeJours: number;
  instructions?: string;
  dateDebut: string;
  dateFin?: string;
  renouvellementAutorise: boolean;
  nombreRenouvellements?: number;
}

export interface Review {
  id?: number;
  patientId: number;
  patientNom?: string;
  medecinId: number;
  medecinNom?: string;
  consultationId?: number;
  note: number;
  commentaire?: string;
  createdAt?: string;
}

export type StatutPaiement = 'EN_ATTENTE' | 'PAYE' | 'PARTIEL' | 'IMPAYE' | 'REMBOURSE';

export interface Invoice {
  id: number;
  numeroFacture: string;
  consultationId?: number;
  patientId: number;
  patientNom: string;
  dateFacture: string;
  dateEcheance?: string;
  montantTotal: number;
  montantPaye: number;
  statut: StatutPaiement;
  actes?: string;
  details?: string;
  modePaiement?: string;
}
