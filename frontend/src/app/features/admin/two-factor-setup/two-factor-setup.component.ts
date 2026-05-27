import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import * as QRCode from 'qrcode';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="two-factor-setup">
      <header class="page-header">
        <h1>Authentification a deux facteurs (2FA)</h1>
        <p>Securisez votre compte administrateur avec une verification supplementaire</p>
      </header>

      @if (isLoading) {
        <div class="loading">Chargement...</div>
      } @else {
        <!-- 2FA Status Card -->
        <div class="status-card" [class.enabled]="is2FAEnabled">
          <div class="status-icon">
            {{ is2FAEnabled ? '&#128274;' : '&#128275;' }}
          </div>
          <div class="status-info">
            <h2>{{ is2FAEnabled ? '2FA Active' : '2FA Desactive' }}</h2>
            <p>{{ is2FAEnabled
              ? 'Votre compte est protege par l\'authentification a deux facteurs'
              : 'Activez la 2FA pour renforcer la securite de votre compte' }}</p>
          </div>
          @if (is2FAEnabled) {
            <button class="btn-danger" (click)="disable2FA()">Desactiver</button>
          } @else {
            <button class="btn-primary" (click)="startSetup()">Activer</button>
          }
        </div>

        @if (is2FAEnabled && !showSetup) {
          <!-- Backup Codes Section -->
          <div class="backup-codes-section">
            <h3>&#128273; Codes de secours</h3>
            <p>Utilisez ces codes si vous perdez acces a votre application d'authentification</p>

            @if (showBackupCodes) {
              <div class="backup-codes-grid">
                @for (code of backupCodes; track code) {
                  <div class="backup-code">{{ code }}</div>
                }
              </div>
              <div class="backup-actions">
                <button class="btn-secondary" (click)="copyBackupCodes()">&#128203; Copier</button>
                <button class="btn-secondary" (click)="downloadBackupCodes()">&#128229; Telecharger</button>
                <button class="btn-secondary" (click)="regenerateBackupCodes()">&#128260; Regenerer</button>
              </div>
            } @else {
              <button class="btn-secondary" (click)="loadBackupCodes()">Afficher les codes</button>
            }
          </div>

          <!-- Recent Activity -->
          <div class="activity-section">
            <h3>&#128202; Activite recente</h3>
            <div class="activity-list">
              @for (activity of recentActivity; track activity.id) {
                <div class="activity-item" [class.failed]="!activity.success">
                  <div class="activity-icon">
                    {{ activity.success ? '&#9989;' : '&#10060;' }}
                  </div>
                  <div class="activity-details">
                    <p class="activity-action">{{ activity.action }}</p>
                    <p class="activity-meta">{{ activity.ip }} - {{ activity.device }}</p>
                  </div>
                  <span class="activity-time">{{ activity.timestamp | date:'dd/MM HH:mm' }}</span>
                </div>
              }
            </div>
          </div>
        }

        @if (showSetup) {
          <!-- Setup Wizard -->
          <div class="setup-wizard">
            <!-- Step 1: Download App -->
            @if (setupStep === 1) {
              <div class="setup-step">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <h3>Telecharger une application d'authentification</h3>
                </div>
                <p>Installez l'une de ces applications sur votre smartphone:</p>

                <div class="auth-apps">
                  <div class="auth-app">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Google_Authenticator.svg/96px-Google_Authenticator.svg.png" alt="Google Authenticator">
                    <span>Google Authenticator</span>
                  </div>
                  <div class="auth-app">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Microsoft_Authenticator_icon.svg/96px-Microsoft_Authenticator_icon.svg.png" alt="Microsoft Authenticator">
                    <span>Microsoft Authenticator</span>
                  </div>
                  <div class="auth-app">
                    <img src="https://authy.com/wp-content/uploads/Authy-App-Icon.svg" alt="Authy">
                    <span>Authy</span>
                  </div>
                </div>

                <button class="btn-primary" (click)="setupStep = 2">Suivant</button>
              </div>
            }

            <!-- Step 2: Scan QR Code -->
            @if (setupStep === 2) {
              <div class="setup-step">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <h3>Scanner le code QR</h3>
                </div>
                <p>Ouvrez votre application d'authentification et scannez ce code:</p>

                <div class="qr-container">
                  <canvas #qrCanvas></canvas>
                </div>

                <div class="secret-key">
                  <p>Ou entrez cette cle manuellement:</p>
                  <code>{{ setupData?.secret }}</code>
                  <button class="btn-icon" (click)="copySecret()">&#128203;</button>
                </div>

                <div class="step-actions">
                  <button class="btn-secondary" (click)="setupStep = 1">Retour</button>
                  <button class="btn-primary" (click)="setupStep = 3">Suivant</button>
                </div>
              </div>
            }

            <!-- Step 3: Verify -->
            @if (setupStep === 3) {
              <div class="setup-step">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <h3>Verifier la configuration</h3>
                </div>
                <p>Entrez le code a 6 chiffres affiche dans votre application:</p>

                <div class="verification-form">
                  <input
                    type="text"
                    [(ngModel)]="verificationCode"
                    placeholder="000000"
                    maxlength="6"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    class="code-input">

                  @if (verificationError) {
                    <p class="error-message">{{ verificationError }}</p>
                  }
                </div>

                <div class="step-actions">
                  <button class="btn-secondary" (click)="setupStep = 2">Retour</button>
                  <button class="btn-primary" (click)="verifyAndEnable()" [disabled]="verificationCode.length !== 6 || isVerifying">
                    {{ isVerifying ? 'Verification...' : 'Activer la 2FA' }}
                  </button>
                </div>
              </div>
            }

            <!-- Step 4: Save Backup Codes -->
            @if (setupStep === 4) {
              <div class="setup-step">
                <div class="step-header">
                  <span class="step-number">&#9989;</span>
                  <h3>Configuration terminee!</h3>
                </div>
                <p class="success-message">La 2FA est maintenant active sur votre compte.</p>

                <div class="backup-codes-warning">
                  <h4>&#9888; Important: Sauvegardez vos codes de secours</h4>
                  <p>Ces codes vous permettront de vous connecter si vous perdez votre telephone.</p>
                </div>

                <div class="backup-codes-grid">
                  @for (code of setupData?.backupCodes; track code) {
                    <div class="backup-code">{{ code }}</div>
                  }
                </div>

                <div class="backup-actions">
                  <button class="btn-secondary" (click)="copyBackupCodes()">&#128203; Copier</button>
                  <button class="btn-secondary" (click)="downloadBackupCodes()">&#128229; Telecharger</button>
                </div>

                <button class="btn-primary" (click)="finishSetup()">Terminer</button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .two-factor-setup { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .page-header h1 { margin: 0 0 8px 0; }
    .page-header p { margin: 0; color: #666; }
    .loading { text-align: center; padding: 60px; }
    .status-card { display: flex; align-items: center; gap: 20px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px; border-left: 4px solid #f44336; }
    .status-card.enabled { border-left-color: #4caf50; }
    .status-icon { font-size: 48px; }
    .status-info { flex: 1; }
    .status-info h2 { margin: 0 0 8px 0; }
    .status-info p { margin: 0; color: #666; }
    .btn-primary { padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-secondary { padding: 12px 24px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
    .btn-danger { padding: 12px 24px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-icon { width: 36px; height: 36px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; }
    .backup-codes-section, .activity-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .backup-codes-section h3, .activity-section h3 { margin: 0 0 12px 0; }
    .backup-codes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin: 20px 0; }
    .backup-code { background: #f5f5f5; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 14px; text-align: center; }
    .backup-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .activity-list { display: flex; flex-direction: column; gap: 12px; }
    .activity-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
    .activity-item.failed { background: #ffebee; }
    .activity-icon { font-size: 20px; }
    .activity-details { flex: 1; }
    .activity-action { margin: 0; font-weight: 500; }
    .activity-meta { margin: 4px 0 0; font-size: 12px; color: #666; }
    .activity-time { font-size: 12px; color: #666; }
    .setup-wizard { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .setup-step { }
    .step-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .step-number { width: 40px; height: 40px; background: #1976d2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
    .step-header h3 { margin: 0; }
    .auth-apps { display: flex; gap: 24px; margin: 24px 0; flex-wrap: wrap; }
    .auth-app { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: #f5f5f5; border-radius: 12px; width: 120px; }
    .auth-app img { width: 48px; height: 48px; }
    .auth-app span { font-size: 12px; text-align: center; }
    .qr-container { display: flex; justify-content: center; margin: 24px 0; }
    .qr-container canvas { border: 1px solid #ddd; border-radius: 12px; padding: 16px; background: white; }
    .secret-key { text-align: center; margin: 20px 0; }
    .secret-key p { margin: 0 0 8px; color: #666; font-size: 14px; }
    .secret-key code { background: #f5f5f5; padding: 12px 20px; border-radius: 8px; font-family: monospace; font-size: 16px; letter-spacing: 2px; }
    .verification-form { max-width: 300px; margin: 24px auto; text-align: center; }
    .code-input { width: 100%; padding: 16px; font-size: 24px; text-align: center; letter-spacing: 8px; border: 2px solid #ddd; border-radius: 12px; font-family: monospace; }
    .code-input:focus { border-color: #1976d2; outline: none; }
    .error-message { color: #c62828; margin-top: 12px; }
    .success-message { color: #2e7d32; font-size: 18px; margin-bottom: 20px; }
    .backup-codes-warning { background: #fff3e0; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .backup-codes-warning h4 { margin: 0 0 8px; color: #e65100; }
    .backup-codes-warning p { margin: 0; color: #666; }
    .step-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class TwoFactorSetupComponent implements OnInit {
  is2FAEnabled = false;
  isLoading = true;
  showSetup = false;
  setupStep = 1;
  setupData: TwoFactorSetup | null = null;

  verificationCode = '';
  verificationError = '';
  isVerifying = false;

  backupCodes: string[] = [];
  showBackupCodes = false;
  recentActivity: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.http.get<{enabled: boolean}>(`${environment.apiUrl}/admin/2fa/status`)
      .subscribe({
        next: (data) => {
          this.is2FAEnabled = data.enabled;
          this.isLoading = false;
          if (this.is2FAEnabled) {
            this.loadRecentActivity();
          }
        },
        error: () => this.isLoading = false
      });
  }

  startSetup(): void {
    this.http.post<TwoFactorSetup>(`${environment.apiUrl}/admin/2fa/setup`, {})
      .subscribe({
        next: (data) => {
          this.setupData = data;
          this.showSetup = true;
          this.setupStep = 1;
        }
      });
  }

  disable2FA(): void {
    if (!confirm('Etes-vous sur de vouloir desactiver la 2FA? Votre compte sera moins securise.')) return;

    const code = prompt('Entrez votre code 2FA actuel pour confirmer:');
    if (!code) return;

    this.http.post(`${environment.apiUrl}/admin/2fa/disable`, { code })
      .subscribe({
        next: () => {
          this.is2FAEnabled = false;
          alert('2FA desactivee avec succes');
        },
        error: () => alert('Code invalide')
      });
  }

  verifyAndEnable(): void {
    if (this.verificationCode.length !== 6) return;

    this.isVerifying = true;
    this.verificationError = '';

    this.http.post(`${environment.apiUrl}/admin/2fa/verify`, {
      code: this.verificationCode,
      secret: this.setupData?.secret
    }).subscribe({
      next: () => {
        this.isVerifying = false;
        this.setupStep = 4;
      },
      error: () => {
        this.isVerifying = false;
        this.verificationError = 'Code invalide. Verifiez et reessayez.';
      }
    });
  }

  finishSetup(): void {
    this.showSetup = false;
    this.is2FAEnabled = true;
    this.loadRecentActivity();
  }

  loadBackupCodes(): void {
    this.http.get<{codes: string[]}>(`${environment.apiUrl}/admin/2fa/backup-codes`)
      .subscribe({
        next: (data) => {
          this.backupCodes = data.codes;
          this.showBackupCodes = true;
        }
      });
  }

  regenerateBackupCodes(): void {
    if (!confirm('Regenerer les codes de secours? Les anciens codes ne seront plus valides.')) return;

    this.http.post<{codes: string[]}>(`${environment.apiUrl}/admin/2fa/regenerate-backup-codes`, {})
      .subscribe({
        next: (data) => {
          this.backupCodes = data.codes;
          alert('Nouveaux codes generes');
        }
      });
  }

  copyBackupCodes(): void {
    const codes = (this.setupData?.backupCodes || this.backupCodes).join('\n');
    navigator.clipboard.writeText(codes);
    alert('Codes copies dans le presse-papier');
  }

  downloadBackupCodes(): void {
    const codes = (this.setupData?.backupCodes || this.backupCodes).join('\n');
    const blob = new Blob([`MediSync - Codes de secours 2FA\n\n${codes}\n\nGardez ces codes en lieu sur.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medisync-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  copySecret(): void {
    if (this.setupData?.secret) {
      navigator.clipboard.writeText(this.setupData.secret);
      alert('Cle copiee');
    }
  }

  loadRecentActivity(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/2fa/activity`)
      .subscribe(data => this.recentActivity = data);
  }
}
