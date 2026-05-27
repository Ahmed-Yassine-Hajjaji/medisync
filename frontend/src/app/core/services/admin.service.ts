import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, Medecin, User } from '../models/user.model';
import { Clinique, DashboardStats } from '../models/clinique.model';
import { Review } from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.adminUrl}/dashboard`);
  }

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.adminUrl}/patients`);
  }

  getAllMedecins(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(`${this.adminUrl}/medecins`);
  }

  createMedecin(data: Partial<Medecin>, password: string): Observable<Medecin> {
    return this.http.post<Medecin>(`${this.adminUrl}/medecins`, data, {
      params: { password }
    });
  }

  createSecretaire(data: Partial<User>, password: string, cliniqueId?: number): Observable<User> {
    const params: any = { password };
    if (cliniqueId) params.cliniqueId = cliniqueId.toString();
    return this.http.post<User>(`${this.adminUrl}/secretaires`, data, { params });
  }

  getAllCliniques(): Observable<Clinique[]> {
    return this.http.get<Clinique[]>(`${this.adminUrl}/cliniques`);
  }

  createClinique(data: Partial<Clinique>): Observable<Clinique> {
    return this.http.post<Clinique>(`${this.adminUrl}/cliniques`, data);
  }

  updateClinique(id: number, data: Partial<Clinique>): Observable<Clinique> {
    return this.http.put<Clinique>(`${this.adminUrl}/cliniques/${id}`, data);
  }

  toggleUserStatus(id: number, enabled: boolean): Observable<void> {
    return this.http.put<void>(`${this.adminUrl}/users/${id}/toggle-status`, null, {
      params: { enabled: enabled.toString() }
    });
  }

  getReportedReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.adminUrl}/reviews/reported`);
  }
}
