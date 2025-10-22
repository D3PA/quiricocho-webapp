import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PlayersService } from '../../services/players.service';

@Component({
  selector: 'app-players-import',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './players-import.html',
  styleUrls: ['./players-import.scss']
})
export class PlayersImportComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; 

  selectedFile: File | null = null;
  isDragOver = false;
  isImporting = false;
  progressPercentage = 0;
  importedCount = 0;
  totalRecords = 0;
  importResult: any = null;

  // constantes para limites de archivo
  private readonly MAX_FILE_SIZE = 200 * 1024 * 1024; 
  private readonly MAX_FILE_SIZE_MB = 200;

  constructor(
    private playersService: PlayersService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDropZoneClick() {
    if (!this.selectedFile && this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  private processFile(file: File) {
    // validar tipo de archivo
    const validTypes = ['.csv', '.xlsx', '.xls', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension) && !validTypes.includes(file.type)) {
      this.showError('Tipo de archivo no válido. Solo se permiten CSV y Excel.');
      return;
    }

    // validar tamaño (200MB)
    if (file.size > this.MAX_FILE_SIZE) {
      this.showError(`El archivo es demasiado grande. Máximo ${this.MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    this.selectedFile = file;
    this.importResult = null;
  }

  removeFile() {
    this.selectedFile = null;
    this.importResult = null;
    this.progressPercentage = 0;
  }

  importCSV() {
    if (!this.selectedFile) return;

    this.isImporting = true;
    this.progressPercentage = 0;
    this.importedCount = 0;
    this.importResult = null;

    this.playersService.importCSV(this.selectedFile).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressPercentage = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.isImporting = false;
          this.importResult = event.body;
          this.showSuccess('Importación completada exitosamente');
        }
      },
      error: (error) => {
        this.isImporting = false;
        console.error('Error importando CSV:', error);
        this.showError('Error al importar el archivo: ' + (error.error?.error || error.message));
      }
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}