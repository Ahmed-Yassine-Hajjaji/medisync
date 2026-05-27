import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consultation, Prescription, Review } from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private patientUrl = `${environment.apiUrl}/patient`;
  private medecinUrl = `${environment.apiUrl}/medecin`;

  constructor(private http: HttpClient) {}

  getPatientConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.patientUrl}/consultations`);
  }

  getConsultationById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.patientUrl}/consultations/${id}`);
  }

  getMedecinConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.medecinUrl}/consultations`);
  }

  createConsultation(appointmentId: number, data: Partial<Consultation>): Observable<Consultation> {
    return this.http.post<Consultation>(`${this.medecinUrl}/consultations/${appointmentId}`, data);
  }

  updateConsultation(id: number, data: Partial<Consultation>): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.medecinUrl}/consultations/${id}`, data);
  }

  addPrescription(consultationId: number, data: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.medecinUrl}/consultations/${consultationId}/prescriptions`, data);
  }

  createReview(data: Review): Observable<Review> {
    return this.http.post<Review>(`${this.patientUrl}/reviews`, data);
  }
}
