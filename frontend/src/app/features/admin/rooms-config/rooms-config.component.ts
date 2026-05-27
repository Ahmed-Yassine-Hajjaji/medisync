import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Room {
  id: number;
  numero: string;
  nom: string;
  type: 'CONSULTATION' | 'SOINS' | 'RADIOLOGIE' | 'CHIRURGIE' | 'ATTENTE';
  etage: number;
  capacite: number;
  equipements: string[];
  disponible: boolean;
  medecinAssigne?: {
    id: number;
    nom: string;
    prenom: string;
    specialite: string;
  };
}

@Component({
  selector: 'app-rooms-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="rooms-config">
      <header class="page-header">
        <div>
          <h1>Configuration des salles</h1>
          <p>Gerez les salles de consultation et leurs equipements</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">
          + Nouvelle salle
        </button>
      </header>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="filterType" (change)="filterRooms()">
          <option value="">Tous les types</option>
          <option value="CONSULTATION">Consultation</option>
          <option value="SOINS">Soins</option>
          <option value="RADIOLOGIE">Radiologie</option>
          <option value="CHIRURGIE">Chirurgie</option>
          <option value="ATTENTE">Salle d'attente</option>
        </select>
        <select [(ngModel)]="filterEtage" (change)="filterRooms()">
          <option value="">Tous les etages</option>
          <option [value]="0">RDC</option>
          <option [value]="1">1er etage</option>
          <option [value]="2">2eme etage</option>
          <option [value]="3">3eme etage</option>
        </select>
        <select [(ngModel)]="filterStatus" (change)="filterRooms()">
          <option value="">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="occupied">Occupee</option>
        </select>
      </div>

      <!-- Floor Plan View -->
      <div class="view-toggle">
        <button [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
          &#9638; Grille
        </button>
        <button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
          &#9776; Liste
        </button>
      </div>

      @if (isLoading) {
        <div class="loading">Chargement...</div>
      } @else {
        @if (viewMode === 'grid') {
          <div class="rooms-grid">
            @for (room of filteredRooms; track room.id) {
              <div class="room-card" [class]="room.type.toLowerCase()" [class.unavailable]="!room.disponible">
                <div class="room-header">
                  <span class="room-number">{{ room.numero }}</span>
                  <span class="room-status" [class.available]="room.disponible">
                    {{ room.disponible ? 'Disponible' : 'Occupee' }}
                  </span>
                </div>

                <h3>{{ room.nom }}</h3>
                <span class="room-type">{{ getTypeLabel(room.type) }}</span>

                <div class="room-info">
                  <p><span class="icon">&#127970;</span> Etage {{ room.etage === 0 ? 'RDC' : room.etage }}</p>
                  <p><span class="icon">&#128101;</span> Capacite: {{ room.capacite }}</p>
                </div>

                @if (room.equipements && room.equipements.length > 0) {
                  <div class="equipements">
                    @for (eq of room.equipements.slice(0, 3); track eq) {
                      <span class="eq-tag">{{ eq }}</span>
                    }
                    @if (room.equipements.length > 3) {
                      <span class="eq-more">+{{ room.equipements.length - 3 }}</span>
                    }
                  </div>
                }

                @if (room.medecinAssigne) {
                  <div class="assigned-doctor">
                    <span class="icon">&#128104;&#8205;&#9877;&#65039;</span>
                    Dr. {{ room.medecinAssigne.prenom }} {{ room.medecinAssigne.nom }}
                  </div>
                }

                <div class="room-actions">
                  <button class="btn-icon" (click)="editRoom(room)" title="Modifier">&#9998;</button>
                  <button class="btn-icon" (click)="assignDoctor(room)" title="Assigner medecin">&#128100;</button>
                  <button class="btn-icon" (click)="toggleAvailability(room)"
                          [title]="room.disponible ? 'Marquer occupee' : 'Marquer disponible'">
                    {{ room.disponible ? '&#128683;' : '&#9989;' }}
                  </button>
                  <button class="btn-icon danger" (click)="deleteRoom(room)" title="Supprimer">&#128465;</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <table class="rooms-table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Etage</th>
                <th>Capacite</th>
                <th>Equipements</th>
                <th>Statut</th>
                <th>Medecin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (room of filteredRooms; track room.id) {
                <tr [class.unavailable]="!room.disponible">
                  <td><strong>{{ room.numero }}</strong></td>
                  <td>{{ room.nom }}</td>
                  <td><span class="type-badge" [class]="room.type.toLowerCase()">{{ getTypeLabel(room.type) }}</span></td>
                  <td>{{ room.etage === 0 ? 'RDC' : room.etage }}</td>
                  <td>{{ room.capacite }}</td>
                  <td>{{ room.equipements?.join(', ') || '-' }}</td>
                  <td>
                    <span class="status-dot" [class.available]="room.disponible"></span>
                    {{ room.disponible ? 'Disponible' : 'Occupee' }}
                  </td>
                  <td>{{ room.medecinAssigne ? 'Dr. ' + room.medecinAssigne.nom : '-' }}</td>
                  <td>
                    <button class="btn-icon" (click)="editRoom(room)">&#9998;</button>
                    <button class="btn-icon danger" (click)="deleteRoom(room)">&#128465;</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        @if (filteredRooms.length === 0) {
          <div class="empty-state">
            <p>Aucune salle trouvee</p>
          </div>
        }
      }

      <!-- Add/Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ editingRoom ? 'Modifier' : 'Nouvelle' }} salle</h2>

            <form [formGroup]="roomForm" (ngSubmit)="saveRoom()">
              <div class="form-row">
                <div class="form-group">
                  <label>Numero *</label>
                  <input type="text" formControlName="numero" placeholder="ex: A101">
                </div>
                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" formControlName="nom" placeholder="ex: Salle cardiologie">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Type *</label>
                  <select formControlName="type">
                    <option value="CONSULTATION">Consultation</option>
                    <option value="SOINS">Soins</option>
                    <option value="RADIOLOGIE">Radiologie</option>
                    <option value="CHIRURGIE">Chirurgie</option>
                    <option value="ATTENTE">Salle d'attente</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Etage *</label>
                  <select formControlName="etage">
                    <option [value]="0">RDC</option>
                    <option [value]="1">1er etage</option>
                    <option [value]="2">2eme etage</option>
                    <option [value]="3">3eme etage</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Capacite</label>
                <input type="number" formControlName="capacite" min="1" max="50">
              </div>

              <div class="form-group">
                <label>Equipements (separes par des virgules)</label>
                <input type="text" formControlName="equipementsText"
                       placeholder="ex: ECG, Tensiometre, Stethoscope">
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="roomForm.invalid || isSaving">
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Assign Doctor Modal -->
      @if (showAssignModal) {
        <div class="modal-overlay" (click)="closeAssignModal()">
          <div class="modal small" (click)="$event.stopPropagation()">
            <h2>Assigner un medecin</h2>
            <p>Salle: <strong>{{ selectedRoom?.nom }}</strong></p>

            <div class="form-group">
              <label>Medecin</label>
              <select [(ngModel)]="selectedDoctorId">
                <option [value]="null">-- Aucun --</option>
                @for (doc of doctors; track doc.id) {
                  <option [value]="doc.id">Dr. {{ doc.prenom }} {{ doc.nom }} - {{ doc.specialite }}</option>
                }
              </select>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeAssignModal()">Annuler</button>
              <button class="btn-primary" (click)="confirmAssignment()">Confirmer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .rooms-config { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; }
    .page-header p { margin: 0; color: #666; }
    .btn-primary { padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-secondary { padding: 12px 24px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
    .filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; min-width: 160px; }
    .view-toggle { display: flex; gap: 8px; margin-bottom: 24px; }
    .view-toggle button { padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer; }
    .view-toggle button.active { background: #1976d2; color: white; border-color: #1976d2; }
    .loading { text-align: center; padding: 60px; color: #666; }
    .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .room-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-top: 4px solid #1976d2; }
    .room-card.consultation { border-top-color: #1976d2; }
    .room-card.soins { border-top-color: #4caf50; }
    .room-card.radiologie { border-top-color: #9c27b0; }
    .room-card.chirurgie { border-top-color: #f44336; }
    .room-card.attente { border-top-color: #ff9800; }
    .room-card.unavailable { opacity: 0.7; }
    .room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .room-number { font-weight: bold; font-size: 18px; }
    .room-status { font-size: 11px; padding: 4px 8px; border-radius: 12px; background: #ffebee; color: #c62828; }
    .room-status.available { background: #e8f5e9; color: #2e7d32; }
    .room-card h3 { margin: 0 0 4px 0; font-size: 16px; }
    .room-type { font-size: 12px; color: #666; }
    .room-info { margin: 12px 0; font-size: 14px; color: #555; }
    .room-info p { margin: 4px 0; }
    .room-info .icon { margin-right: 8px; }
    .equipements { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
    .eq-tag { background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
    .eq-more { background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #666; }
    .assigned-doctor { font-size: 13px; color: #1976d2; margin: 12px 0; padding: 8px; background: #e3f2fd; border-radius: 6px; }
    .room-actions { display: flex; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
    .btn-icon { width: 32px; height: 32px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; }
    .btn-icon:hover { background: #f5f5f5; }
    .btn-icon.danger:hover { background: #ffebee; }
    .rooms-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .rooms-table th, .rooms-table td { padding: 14px; text-align: left; border-bottom: 1px solid #eee; }
    .rooms-table th { background: #f5f5f5; font-weight: 600; font-size: 13px; }
    .rooms-table tr.unavailable { background: #fafafa; }
    .type-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase; }
    .type-badge.consultation { background: #e3f2fd; color: #1565c0; }
    .type-badge.soins { background: #e8f5e9; color: #2e7d32; }
    .type-badge.radiologie { background: #f3e5f5; color: #7b1fa2; }
    .type-badge.chirurgie { background: #ffebee; color: #c62828; }
    .type-badge.attente { background: #fff3e0; color: #e65100; }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f44336; margin-right: 6px; }
    .status-dot.available { background: #4caf50; }
    .empty-state { text-align: center; padding: 60px; color: #666; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; padding: 32px; width: 100%; max-width: 500px; }
    .modal.small { max-width: 400px; }
    .modal h2 { margin: 0 0 24px 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class RoomsConfigComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  doctors: any[] = [];

  filterType = '';
  filterEtage = '';
  filterStatus = '';
  viewMode: 'grid' | 'list' = 'grid';

  isLoading = true;
  showModal = false;
  showAssignModal = false;
  editingRoom: Room | null = null;
  selectedRoom: Room | null = null;
  selectedDoctorId: number | null = null;
  isSaving = false;

  roomForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.roomForm = this.fb.group({
      numero: ['', Validators.required],
      nom: ['', Validators.required],
      type: ['CONSULTATION', Validators.required],
      etage: [0, Validators.required],
      capacite: [1],
      equipementsText: ['']
    });
  }

  ngOnInit(): void {
    this.loadRooms();
    this.loadDoctors();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.http.get<Room[]>(`${environment.apiUrl}/admin/rooms`).subscribe({
      next: (data) => {
        this.rooms = data;
        this.filterRooms();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadDoctors(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/medecins`)
      .subscribe(data => this.doctors = data);
  }

  filterRooms(): void {
    this.filteredRooms = this.rooms.filter(room => {
      if (this.filterType && room.type !== this.filterType) return false;
      if (this.filterEtage !== '' && room.etage !== +this.filterEtage) return false;
      if (this.filterStatus === 'available' && !room.disponible) return false;
      if (this.filterStatus === 'occupied' && room.disponible) return false;
      return true;
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CONSULTATION': 'Consultation',
      'SOINS': 'Soins',
      'RADIOLOGIE': 'Radiologie',
      'CHIRURGIE': 'Chirurgie',
      'ATTENTE': 'Attente'
    };
    return labels[type] || type;
  }

  openAddModal(): void {
    this.editingRoom = null;
    this.roomForm.reset({ type: 'CONSULTATION', etage: 0, capacite: 1 });
    this.showModal = true;
  }

  editRoom(room: Room): void {
    this.editingRoom = room;
    this.roomForm.patchValue({
      ...room,
      equipementsText: room.equipements?.join(', ') || ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingRoom = null;
  }

  saveRoom(): void {
    if (this.roomForm.invalid) return;

    this.isSaving = true;
    const formValue = this.roomForm.value;
    const data = {
      ...formValue,
      equipements: formValue.equipementsText
        ? formValue.equipementsText.split(',').map((e: string) => e.trim()).filter((e: string) => e)
        : []
    };
    delete data.equipementsText;

    const request = this.editingRoom
      ? this.http.put(`${environment.apiUrl}/admin/rooms/${this.editingRoom.id}`, data)
      : this.http.post(`${environment.apiUrl}/admin/rooms`, data);

    request.subscribe({
      next: () => {
        this.loadRooms();
        this.closeModal();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  assignDoctor(room: Room): void {
    this.selectedRoom = room;
    this.selectedDoctorId = room.medecinAssigne?.id || null;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedRoom = null;
  }

  confirmAssignment(): void {
    if (!this.selectedRoom) return;

    this.http.patch(`${environment.apiUrl}/admin/rooms/${this.selectedRoom.id}/assign`, {
      medecinId: this.selectedDoctorId
    }).subscribe({
      next: () => {
        this.loadRooms();
        this.closeAssignModal();
      }
    });
  }

  toggleAvailability(room: Room): void {
    this.http.patch(`${environment.apiUrl}/admin/rooms/${room.id}/toggle-availability`, {})
      .subscribe({
        next: () => {
          room.disponible = !room.disponible;
        }
      });
  }

  deleteRoom(room: Room): void {
    if (!confirm(`Supprimer la salle ${room.numero} - ${room.nom}?`)) return;

    this.http.delete(`${environment.apiUrl}/admin/rooms/${room.id}`).subscribe({
      next: () => this.loadRooms()
    });
  }
}
