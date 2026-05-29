import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/user.model';
import { Invoice } from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientUrl = `${environment.apiUrl}/patient`;
  private secretaireUrl = `${environment.apiUrl}/secretaire`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Patient> {
    return this.http.get<Patient>(`${this.patientUrl}/profile`);
  }

  updateProfile(data: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.patientUrl}/profile`, data);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.patientUrl}/invoices`);
  }

  getDependants(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.patientUrl}/dependants`);
  }

  addDependant(data: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.patientUrl}/dependants`, data);
  }

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.secretaireUrl}/patients`);
  }

  searchPatients(query: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.secretaireUrl}/patients/search`, {
      params: { q: query }
    });
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.secretaireUrl}/patients/${id}`);
  }

  updatePatientBySecretaire(id: number, data: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.secretaireUrl}/patients/${id}`, data);
  }

  createPatientBySecretaire(data: Partial<Patient>, password?: string): Observable<Patient> {
    const params: any = {};
    if (password) params.password = password;
    return this.http.post<Patient>(`${this.secretaireUrl}/patients`, data, { params });
  }

  /** Liste de toutes les factures (espace secrétaire). */
  getAllInvoicesBySecretaire(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.secretaireUrl}/invoices`);
  }

  recordPayment(invoiceId: number, montant: number, modePaiement: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.secretaireUrl}/invoices/${invoiceId}/payment`, null, {
      params: { montant: montant.toString(), modePaiement }
    });
  }
}
