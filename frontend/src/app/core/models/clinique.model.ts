export interface Clinique {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  description?: string;
  horairesOuverture?: string;
  specialitesProposees?: string;
  nombreMedecins?: number;
}

export interface DashboardStats {
  totalPatients: number;
  totalMedecins: number;
  totalAppointmentsToday: number;
  totalAppointmentsMonth: number;
  totalNoShow: number;
  revenueMonth: number;
  revenueYear: number;
  impayesTotal: number;
  tauxOccupation: number;
  appointmentsParJour?: Record<string, number>;
  consultationsParMedecin?: Record<string, number>;
  revenueParMois?: Record<string, number>;
}
