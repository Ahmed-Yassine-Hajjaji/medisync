import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface UploadedDocument {
  id?: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  category?: string;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-container">
      <div
        class="drop-zone"
        [class.drag-over]="isDragOver"
        [class.has-file]="selectedFile"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">

        <input
          #fileInput
          type="file"
          [accept]="acceptedTypes"
          (change)="onFileSelected($event)"
          hidden>

        @if (!selectedFile && !isUploading) {
          <div class="placeholder">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p class="main-text">Glissez votre fichier ici ou cliquez pour parcourir</p>
            <p class="sub-text">PDF, JPG, PNG, DICOM (max {{ maxSizeMB }}MB)</p>
          </div>
        }

        @if (selectedFile && !isUploading) {
          <div class="file-preview">
            <div class="file-icon" [innerHTML]="getFileIcon(selectedFile.type)"></div>
            <div class="file-info">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <button class="remove-btn" (click)="removeFile($event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        }

        @if (isUploading) {
          <div class="uploading">
            <div class="progress-bar">
              <div class="progress" [style.width.%]="uploadProgress"></div>
            </div>
            <p>Telechargement en cours... {{ uploadProgress }}%</p>
          </div>
        }
      </div>

      @if (error) {
        <div class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
          {{ error }}
        </div>
      }

      @if (selectedFile && !isUploading) {
        <div class="actions">
          <select [(ngModel)]="selectedCategory" class="category-select">
            <option value="">Categorie (optionnel)</option>
            <option value="ORDONNANCE">Ordonnance</option>
            <option value="ANALYSE">Analyse medicale</option>
            <option value="RADIOLOGIE">Radiologie</option>
            <option value="COMPTE_RENDU">Compte rendu</option>
            <option value="CERTIFICAT">Certificat</option>
            <option value="AUTRE">Autre</option>
          </select>
          <button class="upload-btn" (click)="uploadFile()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Telecharger
          </button>
        </div>
      }

      @if (uploadedDocuments.length > 0) {
        <div class="uploaded-list">
          <h4>Documents telecharges</h4>
          @for (doc of uploadedDocuments; track doc.filename) {
            <div class="uploaded-item">
              <div class="file-icon" [innerHTML]="getFileIconByMime(doc.mimeType)"></div>
              <div class="file-info">
                <p class="file-name">{{ doc.originalName }}</p>
                <p class="file-meta">{{ doc.category || 'Non categorise' }} - {{ formatFileSize(doc.size) }}</p>
              </div>
              <button class="download-btn" (click)="downloadDocument(doc)" title="Telecharger">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button class="delete-btn" (click)="deleteDocument(doc)" title="Supprimer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      width: 100%;
    }

    .drop-zone {
      border: 2px dashed var(--gray-300);
      border-radius: var(--radius-lg);
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--gray-50);
    }

    .drop-zone:hover, .drop-zone.drag-over {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .drop-zone.has-file {
      border-style: solid;
      border-color: var(--success);
      background: #DCFCE7;
    }

    .placeholder {
      .upload-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        background: var(--primary-light);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
      }

      .main-text {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 500;
        color: var(--gray-700);
      }

      .sub-text {
        margin: 0;
        font-size: 0.875rem;
        color: var(--gray-500);
      }
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--white);
      border-radius: var(--radius-md);
    }

    .file-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-light);
      border-radius: var(--radius-md);
      color: var(--primary);
    }

    .file-info {
      flex: 1;
      text-align: left;

      .file-name {
        margin: 0;
        font-weight: 500;
        color: var(--gray-900);
        word-break: break-all;
      }

      .file-size, .file-meta {
        margin: 0.25rem 0 0 0;
        font-size: 0.8125rem;
        color: var(--gray-500);
      }
    }

    .remove-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--radius-full);
      background: #FEE2E2;
      color: #DC2626;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;

      &:hover {
        background: #FECACA;
      }
    }

    .uploading {
      padding: 1.5rem;

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--gray-600);
      }
    }

    .progress-bar {
      height: 8px;
      background: var(--gray-200);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem 1rem;
      background: #FEE2E2;
      color: #DC2626;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .category-select {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--gray-700);
      background: var(--white);
    }

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--primary-dark);
      }
    }

    .uploaded-list {
      margin-top: 1.5rem;

      h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--gray-700);
      }
    }

    .uploaded-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      margin-bottom: 0.5rem;
    }

    .download-btn, .delete-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .download-btn {
      background: var(--primary-light);
      color: var(--primary);

      &:hover {
        background: #C7D2FE;
      }
    }

    .delete-btn {
      background: #FEE2E2;
      color: #DC2626;

      &:hover {
        background: #FECACA;
      }
    }
  `]
})
export class DocumentUploadComponent {
  @Input() maxSizeMB: number = 20;
  @Input() uploadedDocuments: UploadedDocument[] = [];
  @Output() uploaded = new EventEmitter<UploadedDocument>();
  @Output() deleted = new EventEmitter<UploadedDocument>();

  selectedFile: File | null = null;
  selectedCategory: string = '';
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  error: string | null = null;

  readonly acceptedTypes = '.pdf,.jpg,.jpeg,.png,.dcm,.dicom';
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/dicom',
    'application/octet-stream'
  ];

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    this.error = null;

    // Check file size
    const maxSize = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      this.error = `Le fichier depasse la taille maximale de ${this.maxSizeMB}MB`;
      return;
    }

    // Check file type
    const extension = file.name.toLowerCase().split('.').pop();
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'dcm', 'dicom'];
    if (!extension || !validExtensions.includes(extension)) {
      this.error = 'Type de fichier non supporte. Utilisez PDF, JPG, PNG ou DICOM';
      return;
    }

    this.selectedFile = file;
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.error = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.error = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    if (this.selectedCategory) {
      formData.append('category', this.selectedCategory);
    }

    this.http.post<UploadedDocument>(
      `${environment.apiUrl}/patient/documents/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          const doc = event.body!;
          this.uploadedDocuments.push(doc);
          this.uploaded.emit(doc);
          this.selectedFile = null;
          this.selectedCategory = '';
          this.isUploading = false;
        }
      },
      error: (err) => {
        console.error('Upload error:', err);
        const msg = err?.error?.message || err?.message || '';
        this.error = msg ? `Erreur: ${msg}` : 'Erreur lors du telechargement. Veuillez reessayer.';
        this.isUploading = false;
      }
    });
  }

  downloadDocument(doc: UploadedDocument): void {
    this.http.get(`${environment.apiUrl}/patient/documents/${doc.id}/download`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalName || doc.filename || 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error = 'Erreur lors du telechargement du document.';
      }
    });
  }

  deleteDocument(doc: UploadedDocument): void {
    if (confirm('Supprimer ce document?')) {
      this.http.delete(`${environment.apiUrl}/patient/documents/${doc.id}`).subscribe({
        next: () => {
          this.uploadedDocuments = this.uploadedDocuments.filter(d => d.id !== doc.id);
          this.deleted.emit(doc);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>`;
    }
    if (mimeType === 'application/pdf') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      </svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    </svg>`;
  }

  getFileIconByMime(mimeType: string): string {
    return this.getFileIcon(mimeType);
  }
}
