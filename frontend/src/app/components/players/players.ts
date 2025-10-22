import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service';
import { Player, PlayerFilters } from '../../interfaces/player';
import { ExportCSVModalComponent, ExportCSVData } from '../export-csv-modal/export-csv-modal';

interface ProcessedPlayer extends Player {
  imageUrl: string;
  relevantStats: { name: string; value: number; color: string }[];
  mainPosition: string;
}

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './players.html',
  styleUrl: './players.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerSlideIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger('50ms', [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class PlayersComponent implements OnInit {
  searchForm: FormGroup;
  players: ProcessedPlayer[] = [];
  filteredPlayers: ProcessedPlayer[] = [];
  allResults: ProcessedPlayer[] = [];
  isLoading: boolean = false;
  isSearching: boolean = false;
  isExporting: boolean = false;
  showAllResults: boolean = false;
  searchPerformed: boolean = false;

  fifaVersions = [
    { value: 'all', label: 'Todos los FIFA' },
    { value: '15', label: 'FIFA 15' },
    { value: '16', label: 'FIFA 16' },
    { value: '17', label: 'FIFA 17' },
    { value: '18', label: 'FIFA 18' },
    { value: '19', label: 'FIFA 19' },
    { value: '20', label: 'FIFA 20' },
    { value: '21', label: 'FIFA 21' },
    { value: '22', label: 'FIFA 22' },
    { value: '23', label: 'FIFA 23' }
  ];

  constructor(
    private fb: FormBuilder,
    private playersService: PlayersService,
    public utilsService: UtilsService, 
    private router: Router,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      fifaVersion: ['all']
    });
  }

  ngOnInit() {
    // busqueda en tiempo real 
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value && value.length >= 2) {
          this.onSearchChange(value);
        } else {
          this.players = [];
          this.filteredPlayers = [];
          this.allResults = [];
          this.isSearching = false;
          this.searchPerformed = false;
        }
      });

    this.searchForm.get('fifaVersion')?.valueChanges.subscribe(value => {
      if (this.searchPerformed) {
        this.filterPlayers();
      }
    });
  }

  private processPlayers(players: Player[]): ProcessedPlayer[] {
    return players.map(player => ({
      ...player,
      imageUrl: this.utilsService.getPlayerImage(player),
      relevantStats: this.utilsService.getRelevantStats(player),
      mainPosition: this.utilsService.getMainPosition(player)
    }));
  }

  onSearchChange(searchTerm: string) {
    this.isSearching = true;
    const fifaVersion = this.searchForm.get('fifaVersion')?.value;
    
    this.playersService.searchPlayers(searchTerm, fifaVersion).subscribe({
      next: (response: any) => {
        const players = response.players || response;
        this.players = this.processPlayers(players);
        this.allResults = this.players;
        this.filteredPlayers = this.players.slice(0, 10);
        this.showAllResults = false;
        this.isSearching = false;
        this.searchPerformed = true;
      },
      error: (error) => {
        console.error('Error searching players:', error);
        this.isSearching = false;
        this.searchPerformed = true;
      }
    });
  }

  filterPlayers() {
    const fifaVersion = this.searchForm.get('fifaVersion')?.value;
    const searchTerm = this.searchForm.get('searchTerm')?.value;

    if (!searchTerm) return;

    this.isLoading = true;
    
    this.playersService.searchPlayers(searchTerm, fifaVersion).subscribe({
      next: (response: any) => {
        const players = response.players || response;
        this.allResults = this.processPlayers(players);
        
        if (this.showAllResults) {
          this.filteredPlayers = this.allResults;
        } else {
          this.filteredPlayers = this.allResults.slice(0, 10);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering players:', error);
        this.isLoading = false;
      }
    });
  }

  showAll() {
    this.showAllResults = true;
    this.filteredPlayers = this.allResults;
  }

  selectPlayer(player: ProcessedPlayer) {
    this.router.navigate(['/player', player.id]);
  }

  searchAll() {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (searchTerm) {
      this.showAllResults = true;
      this.filterPlayers();
    }
  }

  clearSearch() {
    this.searchForm.get('searchTerm')?.setValue('');
    this.searchForm.get('fifaVersion')?.setValue('all');
    this.players = [];
    this.filteredPlayers = [];
    this.allResults = [];
    this.showAllResults = false;
    this.searchPerformed = false;
  }

  exportToCSV() {
    // mostrar modal de confirmacion
    const dialogRef = this.dialog.open(ExportCSVModalComponent, {
      width: '600px',
      data: {
        totalPlayers: this.filteredPlayers.length,
        searchTerm: this.searchForm.get('searchTerm')?.value,
        fifaVersion: this.searchForm.get('fifaVersion')?.value,
        samplePlayers: this.filteredPlayers
      } as ExportCSVData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performCSVExport();
      }
    });
  }

  private getCurrentFilters(): PlayerFilters {
    const filters: PlayerFilters = {};
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    const fifaVersion = this.searchForm.get('fifaVersion')?.value;

    if (searchTerm) filters.search = searchTerm;
    if (fifaVersion && fifaVersion !== 'all') filters.fifa_version = fifaVersion;

    return filters;
  }

  private performCSVExport() {
    this.isExporting = true;
    
    const filters = this.getCurrentFilters();

    this.playersService.exportCSV(filters).subscribe({
      next: (blob: Blob) => {
        // crear nombre de archivo 
        const timestamp = new Date().toISOString().split('T')[0];
        let filename = `quiricocho_fifa_jugadores_${timestamp}`;
        
        const searchTerm = this.searchForm.get('searchTerm')?.value;
        const fifaVersion = this.searchForm.get('fifaVersion')?.value;

        if (searchTerm) {
          filename = `quiricocho_fifa_jugadores_${searchTerm.replace(/\s+/g, '_')}_${timestamp}`;
        } else if (fifaVersion && fifaVersion !== 'all') {
          filename = `quiricocho_fifa_jugadores_${fifaVersion}_${timestamp}`;
        }
        
        filename += '.csv';

        // crear descarga del archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.isExporting = false;
        
        this.showExportSuccess(filename);
      },
      error: (error) => {
        console.error('Error exportando CSV:', error);
        this.isExporting = false;
        this.showExportError();
      }
    });
  }

  private showExportSuccess(filename: string) {
    console.log(`CSV exportado exitosamente: ${filename}`);
    alert(`CSV exportado exitosamente: ${filename}`);
  }

  private showExportError() {
    console.error('Error al exportar CSV');
    alert('Error al exportar el archivo CSV. Por favor, intenta nuevamente.');
  }
}