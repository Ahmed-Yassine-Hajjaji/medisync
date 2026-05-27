import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentCreateRequest } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private patientUrl = `${environment.apiUrl}/patient/appointments`;
  private medecinUrl = `${environment.apiUrl}/medecin/appointments`;
  private secretaireUrl = `${environment.apiUrl}/secretaire/appointments`;

  constructor(private http: HttpClient) {}

  getPatientAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.patientUrl);
  }

  createPatientAppointment(data: AppointmentCreateRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.patientUrl, data);
  }

  cancelPatientAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.patientUrl}/${id}/cancel`, {});
  }

  getMedecinAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.medecinUrl);
  }

  getMedecinAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.medecinUrl}/date/${date}`);
  }

  getMedecinAppointmentsByRange(start: string, end: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.medecinUrl}/range`, {
      params: { start, end }
    });
  }

  confirmAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.medecinUrl}/${id}/confirm`, {});
  }

  cancelMedecinAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.medecinUrl}/${id}/cancel`, {});
  }

  markNoShow(id: number): Observable<void> {
    return this.http.put<void>(`${this.medecinUrl}/${id}/no-show`, {});
  }

  createSecretaireAppointment(data: AppointmentCreateRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.secretaireUrl, data);
  }

  confirmSecretaireAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.secretaireUrl}/${id}/confirm`, {});
  }

  cancelSecretaireAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.secretaireUrl}/${id}/cancel`, {});
  }

  getAppointmentsByMedecinAndDate(medecinId: number, date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.secretaireUrl}/medecin/${medecinId}/date/${date}`);
  }
}
