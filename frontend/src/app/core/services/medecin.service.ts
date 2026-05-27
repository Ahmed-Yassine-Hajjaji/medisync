import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medecin } from '../models/user.model';
import { Creneau, Disponibilite } from '../models/appointment.model';
import { Review } from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private publicUrl = `${environment.apiUrl}/public/medecins`;
  private medecinUrl = `${environment.apiUrl}/medecin`;

  constructor(private http: HttpClient) {}

  getAllMedecins(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(this.publicUrl);
  }

  getMedecinById(id: number): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.publicUrl}/${id}`);
  }

  searchMedecins(query: string): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(`${this.publicUrl}/search`, {
      params: { q: query }
    });
  }

  getMedecinsBySpecialite(specialite: string): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(`${this.publicUrl}/specialite/${specialite}`);
  }

  filterMedecins(specialite: string, ville: string): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(`${this.publicUrl}/filter`, {
      params: { specialite, ville }
    });
  }

  getCreneauxDisponibles(medecinId: number, date: string): Observable<Creneau[]> {
    return this.http.get<Creneau[]>(`${this.publicUrl}/${medecinId}/creneaux`, {
      params: { date }
    });
  }

  getMedecinReviews(medecinId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.publicUrl}/${medecinId}/reviews`);
  }

  getSpecialites(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/public/specialites`);
  }

  getProfile(): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.medecinUrl}/profile`);
  }

  updateProfile(data: Partial<Medecin>): Observable<Medecin> {
    return this.http.put<Medecin>(`${this.medecinUrl}/profile`, data);
  }

  getDisponibilites(): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(`${this.medecinUrl}/disponibilites`);
  }

  addDisponibilite(dispo: Disponibilite): Observable<Disponibilite> {
    return this.http.post<Disponibilite>(`${this.medecinUrl}/disponibilites`, dispo);
  }
}
