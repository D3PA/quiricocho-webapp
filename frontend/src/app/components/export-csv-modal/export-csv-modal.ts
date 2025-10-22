import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ExportCSVData {
  totalPlayers: number;
  searchTerm?: string;
  fifaVersion?: string;
  samplePlayers: any[];
}

@Component({
  selector: 'app-export-csv-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="export-modal dark-theme">
      <h2 mat-dialog-title class="modal-title">
        <mat-icon>file_download</mat-icon>
        Exportar a CSV
      </h2>
      
      <mat-dialog-content class="modal-content">
        <div class="export-info">
          <div class="info-item">
            <mat-icon>people</mat-icon>
            <div class="info-content">
              <span class="info-label">Total de jugadores:</span>
              <span class="info-value highlight">{{ data.totalPlayers | number }}</span>
            </div>
          </div>

          <div class="info-item" *ngIf="data.searchTerm">
            <mat-icon>search</mat-icon>
            <div class="info-content">
              <span class="info-label">Búsqueda:</span>
              <span class="info-value">"{{ data.searchTerm }}"</span>
            </div>
          </div>

          <div class="info-item" *ngIf="data.fifaVersion && data.fifaVersion !== 'all'">
            <mat-icon>sports_esports</mat-icon>
            <div class="info-content">
              <span class="info-label">Versión:</span>
              <span class="info-value">FIFA {{ data.fifaVersion }}</span>
            </div>
          </div>
        </div>

        <!-- VISTA PREVIA -->
        <div class="export-preview" *ngIf="data.totalPlayers > 0">
          <h3 class="preview-title">
            Vista previa ({{ getPreviewPlayers().length }} de {{ data.totalPlayers }})
          </h3>
          <div class="preview-table">
            <div class="table-header">
              <span>Nombre</span>
              <span>Overall</span>
              <span>Club</span>
            </div>
            <div class="table-row" *ngFor="let player of getPreviewPlayers()">
              <span class="player-name">{{ player.long_name || player.short_name || 'N/A' }}</span>
              <span class="player-overall" [style.color]="getOverallColor(player.overall)">
                {{ player.overall || 'N/A' }}
              </span>
              <span class="player-club">{{ player.club_name || 'Sin club' }}</span>
            </div>
          </div>
        </div>

        <div class="warning-message" *ngIf="data.totalPlayers > 1000">
          <mat-icon>warning</mat-icon>
          <div class="warning-content">
            <strong>Exportación grande:</strong> {{ data.totalPlayers | number }} jugadores.
          </div>
        </div>

        <div class="no-data" *ngIf="data.totalPlayers === 0">
          <mat-icon>info</mat-icon>
          <span>No hay jugadores para exportar</span>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button 
          mat-raised-button 
          color="accent" 
          (click)="onConfirm()"
          [disabled]="data.totalPlayers === 0"
          class="confirm-btn"
        >
          <mat-icon>file_download</mat-icon>
          Descargar CSV
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .export-modal.dark-theme {
      background: var(--bg-card) !important;
      color: var(--text-primary) !important;
      border-radius: 12px;
      padding: 0;
      min-width: 500px;
      max-width: 600px;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff9800 !important;
      margin: 0;
      padding: 20px 24px 16px 24px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Exo 2', sans-serif;
      font-size: 1.3em;
      font-weight: 700;
    }

    .modal-title mat-icon {
      color: #ff9800;
    }

    .modal-content {
      padding: 20px 24px !important;
      color: var(--text-primary) !important;
      background: transparent !important;
      font-family: 'Exo 2', sans-serif;
      max-height: 60vh;
      overflow-y: auto;
    }

    .export-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-item mat-icon {
      color: #ff9800;
      flex-shrink: 0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: 0.85em;
      color: var(--text-secondary);
    }

    .info-value {
      font-weight: 600;
      color: var(--text-primary);
    }

    .highlight {
      color: #ff9800 !important;
      font-size: 1.1em;
    }

    .export-preview {
      margin: 20px 0;
    }

    .preview-title {
      color: var(--text-primary);
      margin-bottom: 12px;
      font-size: 1em;
      font-weight: 600;
    }

    .preview-table {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 2fr 0.8fr 1.5fr;
      gap: 12px;
      padding: 8px 12px;
      align-items: center;
    }

    .table-header {
      background: rgba(255, 152, 0, 0.1);
      border-radius: 6px;
      font-weight: 600;
      color: #ff9800;
      font-size: 0.8em;
    }

    .table-row {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      font-size: 0.85em;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .player-name {
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-overall {
      font-weight: 700;
      text-align: center;
      font-size: 1em;
    }

    .player-club {
      color: var(--text-secondary);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .warning-message, .no-data {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      margin: 16px 0;
    }

    .warning-message {
      background: rgba(255, 152, 0, 0.1);
      border: 1px solid rgba(255, 152, 0, 0.3);
      color: #ff9800;
    }

    .no-data {
      background: rgba(255, 71, 87, 0.1);
      border: 1px solid rgba(255, 71, 87, 0.3);
      color: #ff4757;
    }

    .modal-actions {
      margin: 0;
      padding: 16px 24px !important;
      background: rgba(255, 255, 255, 0.05);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0 0 12px 12px;
    }

    .cancel-btn {
      border-color: #6c757d !important;
      color: #6c757d !important;
      font-family: 'Exo 2', sans-serif;
      font-weight: 600;
    }

    .cancel-btn:hover {
      background: rgba(108, 117, 125, 0.1) !important;
    }

    .confirm-btn {
      background: #ff9800 !important;
      color: white !important;
      font-family: 'Exo 2', sans-serif;
      font-weight: 600;
    }

    .confirm-btn:hover:not(:disabled) {
      background: #f57c00 !important;
    }

    .confirm-btn:disabled {
      background: #6c757d !important;
      border-color: #6c757d !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .export-modal.dark-theme {
        min-width: 85vw;
        max-width: 90vw;
      }
    }

    @media (max-width: 480px) {
      .export-modal.dark-theme {
        min-width: 95vw;
        max-width: 98vw;
      }

      .table-header, .table-row {
        grid-template-columns: 2fr 0.8fr 1fr;
        gap: 8px;
        font-size: 0.8em;
        padding: 6px 8px;
      }

      .modal-actions {
        flex-direction: column;
        gap: 8px;
      }

      .cancel-btn, .confirm-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ExportCSVModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ExportCSVModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportCSVData
  ) {}

  getPreviewPlayers() {
    return this.data.samplePlayers.slice(0, 5);
  }

  getOverallColor(overall: number): string {
    if (overall >= 85) return '#00ff88';
    if (overall >= 75) return '#4fc3f7';
    if (overall >= 65) return '#ffd54f';
    return '#ff6b6b';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}