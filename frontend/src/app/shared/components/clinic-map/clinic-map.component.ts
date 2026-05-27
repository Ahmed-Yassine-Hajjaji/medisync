import { Component, Input, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-clinic-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapElement class="map"></div>
      <div class="map-controls">
        <button class="map-btn" (click)="centerOnClinic()" title="Centrer sur la clinique">
          <span class="icon">&#127973;</span>
        </button>
        <button class="map-btn" (click)="centerOnMe()" title="Ma position">
          <span class="icon">&#128205;</span>
        </button>
        <a class="map-btn directions" [href]="directionsUrl" target="_blank" title="Itineraire">
          <span class="icon">&#128663;</span>
        </a>
      </div>
      @if (clinicAddress) {
        <div class="clinic-info">
          <h4>{{ clinicName || 'Clinique MediSync' }}</h4>
          <p><span class="icon">&#128205;</span> {{ clinicAddress }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
    }
    .map {
      width: 100%;
      height: 100%;
    }
    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1000;
    }
    .map-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    .map-btn:hover {
      transform: scale(1.1);
    }
    .map-btn .icon {
      font-size: 18px;
    }
    .directions {
      background: #4285f4;
      color: white;
    }
    .clinic-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 16px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .clinic-info h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .clinic-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class ClinicMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement') mapElement!: ElementRef;

  @Input() clinicName?: string;
  @Input() clinicLat: number = 48.8566;
  @Input() clinicLng: number = 2.3522;
  @Input() clinicAddress?: string;

  private map!: L.Map;
  private clinicMarker!: L.Marker;
  private userMarker?: L.Marker;
  private userPosition?: [number, number];

  get directionsUrl(): string {
    const from = this.userPosition ? `${this.userPosition[0]},${this.userPosition[1]}` : '';
    return `https://www.openstreetmap.org/directions?from=${from}&to=${this.clinicLat},${this.clinicLng}`;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.getUserLocation();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Fix Leaflet default marker icon issue
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map(this.mapElement.nativeElement).setView([this.clinicLat, this.clinicLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Clinic marker
    const clinicIcon = L.divIcon({
      className: 'clinic-marker',
      html: `<div style="background: #e53935; color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
        &#127973; ${this.clinicName || 'Clinique'}
      </div>`,
      iconSize: [120, 40],
      iconAnchor: [60, 40]
    });

    this.clinicMarker = L.marker([this.clinicLat, this.clinicLng], { icon: clinicIcon })
      .addTo(this.map)
      .bindPopup(`<b>${this.clinicName || 'Clinique MediSync'}</b><br>${this.clinicAddress || ''}`);
  }

  private getUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userPosition = [position.coords.latitude, position.coords.longitude];

          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `<div style="background: #1976d2; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          this.userMarker = L.marker(this.userPosition, { icon: userIcon })
            .addTo(this.map)
            .bindPopup('Votre position');
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }

  centerOnClinic(): void {
    this.map.setView([this.clinicLat, this.clinicLng], 15);
  }

  centerOnMe(): void {
    if (this.userPosition) {
      this.map.setView(this.userPosition, 15);
    }
  }
}
