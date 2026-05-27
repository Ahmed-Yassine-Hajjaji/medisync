export type StatutAppointment = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'NO_SHOW';
export type MotifConsultation = 'CONSULTATION_GENERALE' | 'SUIVI' | 'URGENCE' | 'VACCINATION' | 'CERTIFICAT_MEDICAL' | 'RENOUVELLEMENT_ORDONNANCE' | 'AUTRE';

export interface Appointment {
  id: number;
  patientId: number;
  patientNom: string;
  patientPrenom: string;
  medecinId: number;
  medecinNom: string;
  medecinPrenom: string;
  medecinSpecialite: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  motif: MotifConsultation;
  notes?: string;
  statut: StatutAppointment;
}

export interface AppointmentCreateRequest {
  patientId?: number;
  medecinId: number;
  date: string;
  heureDebut: string;
  motif: MotifConsultation;
  notes?: string;
}

export interface Creneau {
  date: string;
  heureDebut: string;
  heureFin: string;
  disponible: boolean;
}

export interface Disponibilite {
  id?: number;
  medecinId: number;
  jourSemaine?: string;
  dateSpecifique?: string;
  heureDebut: string;
  heureFin: string;
  estConge: boolean;
  recurrent: boolean;
}
