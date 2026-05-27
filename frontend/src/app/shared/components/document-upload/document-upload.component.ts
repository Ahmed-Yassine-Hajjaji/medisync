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
            <span class="upload-icon">&#128196;</span>
            <p class="main-text">Glissez votre fichier ici ou cliquez pour parcourir</p>
            <p class="sub-text">PDF, JPG, PNG, DICOM (max {{ maxSizeMB }}MB)</p>
          </div>
        }

        @if (selectedFile && !isUploading) {
          <div class="file-preview">
            <span class="file-icon">{{ getFileIcon(selectedFile.type) }}</span>
            <div class="file-info">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <button class="remove-btn" (click)="removeFile($event)">&#10005;</button>
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
          <span>&#9888;</span> {{ error }}
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
            Telecharger le document
          </button>
        </div>
      }

      @if (uploadedDocuments.length > 0) {
        <div class="uploaded-list">
          <h4>Documents telecharges</h4>
          @for (doc of uploadedDocuments; track doc.filename) {
            <div class="uploaded-item">
              <span class="file-icon">{{ getFileIconByMime(doc.mimeType) }}</span>
              <div class="file-info">
                <p class="file-name">{{ doc.originalName }}</p>
                <p class="file-meta">{{ doc.category || 'Non categorise' }} - {{ formatFileSize(doc.size) }}</p>
              </div>
              <button class="download-btn" (click)="downloadDocument(doc)">&#128229;</button>
              <button class="delete-btn" (click)="deleteDocument(doc)">&#128465;</button>
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
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #fafafa;
    }
    .drop-zone:hover, .drop-zone.drag-over {
      border-color: #1976d2;
      background: #e3f2fd;
    }
    .drop-zone.has-file {
      border-style: solid;
      border-color: #4caf50;
      background: #e8f5e9;
    }
    .placeholder .upload-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }
    .placeholder .main-text {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #333;
    }
    .placeholder .sub-text {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .file-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
    }
    .file-icon {
      font-size: 32px;
    }
    .file-info {
      flex: 1;
      text-align: left;
    }
    .file-name {
      margin: 0;
      font-weight: 500;
      word-break: break-all;
    }
    .file-size, .file-meta {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #666;
    }
    .remove-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: #f44336;
      color: white;
      cursor: pointer;
      font-size: 14px;
    }
    .uploading {
      padding: 20px;
    }
    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .progress {
      height: 100%;
      background: #1976d2;
      transition: width 0.3s;
    }
    .error-message {
      margin-top: 12px;
      padding: 12px;
      background: #ffebee;
      color: #c62828;
      border-radius: 8px;
      font-size: 14px;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .category-select {
      flex: 1;
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
    }
    .upload-btn {
      padding: 12px 24px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }
    .upload-btn:hover {
      background: #1565c0;
    }
    .uploaded-list {
      margin-top: 24px;
    }
    .uploaded-list h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .uploaded-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .download-btn, .delete-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    }
    .download-btn {
      background: #e3f2fd;
      color: #1976d2;
    }
    .delete-btn {
      background: #ffebee;
      color: #c62828;
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
        this.error = 'Erreur lors du telechargement. Veuillez reessayer.';
        this.isUploading = false;
      }
    });
  }

  downloadDocument(doc: UploadedDocument): void {
    window.open(`${environment.apiUrl}/patient/documents/${doc.id}/download`, '_blank');
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
    if (mimeType.startsWith('image/')) return '&#128247;';
    if (mimeType === 'application/pdf') return '&#128196;';
    return '&#128462;';
  }

  getFileIconByMime(mimeType: string): string {
    return this.getFileIcon(mimeType);
  }
}
