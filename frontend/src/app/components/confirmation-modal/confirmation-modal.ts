import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ChangesData {
  originalPlayer: any;
  updatedPlayer: any;
  changes: { field: string; original: any; updated: any }[];
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-modal dark-theme">
      <h2 mat-dialog-title class="modal-title">
        <mat-icon>warning</mat-icon>
        Confirmar Cambios
      </h2>
      
      <mat-dialog-content class="modal-content">
        <p class="confirmation-text">¿Estás seguro de que deseas guardar los siguientes cambios?</p>
        
        <div class="changes-list" *ngIf="data.changes.length > 0">
          <h3 class="changes-title">Cambios a realizar:</h3>
          <div class="change-item" *ngFor="let change of data.changes">
            <div class="field-name">{{ getFieldLabel(change.field) }}</div>
            <div class="change-details">
              <span class="old-value">{{ change.original || 'Vacío' }}</span>
              <mat-icon class="arrow">arrow_forward</mat-icon>
              <span class="new-value">{{ change.updated || 'Vacío' }}</span>
            </div>
          </div>
        </div>
        
        <div class="no-changes" *ngIf="data.changes.length === 0">
          <mat-icon>info</mat-icon>
          <p>No se detectaron cambios</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onConfirm()"
          [disabled]="data.changes.length === 0"
          class="confirm-btn"
        >
          <mat-icon>check_circle</mat-icon>
          Confirmar Cambios
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-modal.dark-theme {
      background: var(--bg-card) !important;
      color: var(--text-primary) !important;
      border-radius: 12px;
      padding: 0;
      min-width: 500px;
      max-width: 700px;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffa726 !important;
      margin: 0;
      padding: 20px 24px 16px 24px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Exo 2', sans-serif;
      font-size: 1.3em;
      font-weight: 700;
    }

    .modal-title mat-icon {
      color: #ffa726;
    }

    .modal-content {
      padding: 20px 24px !important;
      color: var(--text-primary) !important;
      background: transparent !important;
      font-family: 'Exo 2', sans-serif;
    }

    .confirmation-text {
      font-size: 1.1em;
      margin-bottom: 20px;
      color: var(--text-primary);
      line-height: 1.5;
    }

    .changes-list {
      margin-top: 16px;
    }

    .changes-title {
      color: var(--text-primary) !important;
      margin-bottom: 12px;
      font-size: 1em;
      font-weight: 600;
      font-family: 'Exo 2', sans-serif;
    }

    .change-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .change-item:hover {
      border-color: rgba(0, 255, 136, 0.3);
      background: rgba(0, 255, 136, 0.05);
    }

    .field-name {
      font-weight: 600;
      color: var(--text-primary);
      min-width: 120px;
      font-family: 'Exo 2', sans-serif;
    }

    .change-details {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      justify-content: flex-end;
    }

    .old-value {
      color: #ff4757;
      text-decoration: line-through;
      background: rgba(255, 71, 87, 0.1);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.9em;
      font-weight: 500;
      border: 1px solid rgba(255, 71, 87, 0.3);
      font-family: 'Exo 2', sans-serif;
    }

    .new-value {
      color: #00ff88;
      background: rgba(0, 255, 136, 0.1);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.9em;
      font-weight: 500;
      border: 1px solid rgba(0, 255, 136, 0.3);
      font-family: 'Exo 2', sans-serif;
    }

    .arrow {
      color: var(--text-secondary);
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .no-changes {
      text-align: center;
      padding: 30px 20px;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px dashed rgba(255, 255, 255, 0.2);
      font-family: 'Exo 2', sans-serif;
    }

    .no-changes mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      color: var(--text-muted);
    }

    .no-changes p {
      margin: 0;
      font-size: 1em;
    }

    .modal-actions {
      margin: 0;
      padding: 16px 24px !important;
      background: rgba(255, 255, 255, 0.05);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0 0 12px 12px;
    }

    .cancel-btn {
      border-color: #ff4757 !important;
      color: #ff4757 !important;
      font-family: 'Exo 2', sans-serif;
      font-weight: 600;
    }

    .cancel-btn:hover {
      background: rgba(255, 71, 87, 0.1) !important;
    }

    .confirm-btn {
      background: var(--primary-color) !important;
      color: #000 !important;
      font-family: 'Exo 2', sans-serif;
      font-weight: 600;
    }

    .confirm-btn:hover:not(:disabled) {
      background: var(--primary-dark) !important;
      transform: translateY(-1px);
    }

    .confirm-btn:disabled {
      background: var(--text-muted) !important;
      color: var(--text-secondary) !important;
      cursor: not-allowed;
    }

    button {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
    }

    /* Override de Material Dialog */
    ::ng-deep .mat-mdc-dialog-container {
      --mdc-dialog-container-color: transparent !important;
      --mdc-dialog-with-divider-divider-color: rgba(255, 255, 255, 0.1) !important;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      background: var(--bg-card) !important;
      border-radius: 12px !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    }

    ::ng-deep .mat-mdc-dialog-title {
      color: var(--text-primary) !important;
      font-family: 'Exo 2', sans-serif !important;
    }

    ::ng-deep .mat-mdc-dialog-content {
      color: var(--text-primary) !important;
      font-family: 'Exo 2', sans-serif !important;
    }

    ::ng-deep .mat-mdc-dialog-actions {
      padding: 16px 24px !important;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .confirmation-modal.dark-theme {
        min-width: 85vw !important;
        max-width: 90vw !important;
        margin: 15px;
      }

      .modal-title {
        padding: 14px 18px 10px 18px !important;
        font-size: 1.15em !important;
      }

      .modal-content {
        padding: 16px 18px !important;
      }

      .change-item {
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 10px;
      }

      .field-name {
        min-width: 100px;
        font-size: 0.85em;
      }

      .change-details {
        flex: 1;
        justify-content: flex-end;
      }

      .old-value, .new-value {
        font-size: 0.8em;
        padding: 4px 8px;
        min-width: 60px;
        text-align: center;
      }

      .arrow {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .modal-actions {
        padding: 14px 18px !important;
        flex-direction: row;
        gap: 10px;
      }

      .cancel-btn, .confirm-btn {
        min-width: 140px;
        height: 42px;
        font-size: 0.9em;
      }
    }

    @media (max-width: 600px) {
      .confirmation-modal.dark-theme {
        min-width: 92vw !important;
        max-width: 96vw !important;
        margin: 10px;
      }

      .modal-title {
        padding: 12px 16px 8px 16px !important;
        font-size: 1.1em !important;
      }

      .modal-content {
        padding: 14px 16px !important;
      }

      .confirmation-text {
        font-size: 1em;
        margin-bottom: 16px;
        text-align: center;
      }

      .changes-title {
        font-size: 0.95em;
        text-align: center;
      }

      .change-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 8px;
      }

      .field-name {
        min-width: auto;
        font-size: 0.85em;
        text-align: center;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
      }

      .change-details {
        flex-direction: row;
        justify-content: space-between;
        gap: 8px;
      }

      .old-value, .new-value {
        flex: 1;
        font-size: 0.8em;
        padding: 6px 8px;
        min-width: auto;
      }

      .arrow {
        align-self: center;
      }

      .modal-actions {
        padding: 12px 16px !important;
        flex-direction: column;
        gap: 8px;
      }

      .cancel-btn, .confirm-btn {
        min-width: 100%;
        height: 44px;
        font-size: 0.95em;
      }
    }

    @media (max-width: 480px) {
      .confirmation-modal.dark-theme {
        min-width: 96vw !important;
        max-width: 98vw !important;
        margin: 8px;
        border-radius: 10px;
      }

      .modal-title {
        padding: 10px 14px 6px 14px !important;
        font-size: 1em !important;
      }

      .modal-title mat-icon {
        font-size: 1.2em;
      }

      .modal-content {
        padding: 12px 14px !important;
        max-height: 60vh;
        overflow-y: auto;
      }

      .confirmation-text {
        font-size: 0.95em;
        margin-bottom: 14px;
      }

      .changes-title {
        font-size: 0.9em;
        margin-bottom: 10px;
      }

      .change-item {
        padding: 6px;
        margin-bottom: 6px;
      }

      .field-name {
        font-size: 0.8em;
        padding: 3px 6px;
      }

      .change-details {
        gap: 6px;
      }

      .old-value, .new-value {
        font-size: 0.75em;
        padding: 4px 6px;
      }

      .arrow {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .modal-actions {
        padding: 10px 14px !important;
        gap: 6px;
      }

      .cancel-btn, .confirm-btn {
        height: 40px;
        font-size: 0.9em;
      }

      button mat-icon {
        font-size: 1.1em;
        width: 1.1em;
        height: 1.1em;
      }
    }

    .modal-content {
      scrollbar-width: thin;
      scrollbar-color: var(--primary-color) rgba(255, 255, 255, 0.1);
    }

    .modal-content::-webkit-scrollbar {
      width: 4px;
    }

    .modal-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    .modal-content::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 2px;
    }
  `]
})
export class ConfirmationModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangesData
  ) {}

  getFieldLabel(field: string): string {
    const fieldLabels: { [key: string]: string } = {
      'long_name': 'Nombre',
      'player_positions': 'Posiciones',
      'club_name': 'Club',
      'nationality_name': 'Nacionalidad',
      'age': 'Edad',
      'height_cm': 'Altura (cm)',
      'weight_kg': 'Peso (kg)',
      'body_type': 'Tipo de Cuerpo',
      'preferred_foot': 'Pierna Hábil',
      'overall': 'Overall',
      'potential': 'Potencial',
      'pace': 'Ritmo',
      'shooting': 'Tiro',
      'passing': 'Pase',
      'dribbling': 'Regate',
      'defending': 'Defensa',
      'physic': 'Físico',
      'weak_foot': 'Pierna Mala',
      'skill_moves': 'Skill Moves',
      'international_reputation': 'Reputación',
      'work_rate': 'Work Rate',
      'value_eur': 'Valor (€)',
      'wage_eur': 'Salario (€)',
      'player_traits': 'Player Traits',
      'attacking_crossing': 'Centros',
      'attacking_finishing': 'Definición',
      'attacking_heading_accuracy': 'Cabeza',
      'attacking_short_passing': 'Pase Corto',
      'attacking_volleys': 'Voleas',
      'skill_dribbling': 'Regate Técnico',
      'skill_curve': 'Efecto',
      'skill_fk_accuracy': 'Faltas',
      'skill_long_passing': 'Pase Largo',
      'skill_ball_control': 'Control',
      'movement_acceleration': 'Aceleración',
      'movement_sprint_speed': 'Velocidad',
      'movement_agility': 'Agilidad',
      'movement_reactions': 'Reacciones',
      'movement_balance': 'Equilibrio'
    };
    
    return fieldLabels[field] || field;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}