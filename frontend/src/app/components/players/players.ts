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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service';
import { Player } from '../../interfaces/player';

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
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      fifaVersion: ['all']
    });
  }

  ngOnInit() {
      this.playersService.searchPlayers('messi').subscribe({
    next: (players) => {
      console.log('Datos que llegan:', players);
      if (players.length > 0) {
        console.log('Primer jugador:', players[0]);
        console.log('Tiene potential?', 'potential' in players[0]);
        console.log('Tiene attacking_finishing?', 'attacking_finishing' in players[0]);
      }
    },
    error: (error) => console.error('Error debug:', error)
  });
    // busqueda en tiempo real con debounce
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
}