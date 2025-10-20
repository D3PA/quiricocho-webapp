import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { trigger, transition, style, animate } from '@angular/animations';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service'; 
import { Player } from '../../interfaces/player';

interface ProcessedPlayer extends Player {
  imageUrl: string;
  mainPosition: string; 
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  
  stats = [
    { icon: 'sports_soccer', number: '160K+', label: 'Jugadores' },
    { icon: 'flag', number: '180+', label: 'Nacionalidades' },
    { icon: 'groups', number: '700+', label: 'Clubes' },
    { icon: 'update', number: '9', label: 'Versiones de FIFA' }
  ];

  features = [
    {
      icon: 'search',
      title: 'Búsqueda Avanzada',
      description: 'Encuentra jugadores por nombre, club, posición y más con nuestro sistema de filtros avanzado.'
    },
    {
      icon: 'analytics',
      title: 'Estadísticas Detalladas',
      description: 'Analiza habilidades específicas y compara jugadores con gráficos interactivos y datos precisos.'
    },
    {
      icon: 'trending_up',
      title: 'Evolución Temporal',
      description: 'Sigue el desarrollo de los jugadores a través de las diferentes versiones de FIFA.'
    }
  ];

  fifaVersions: string[] = ['23', '22', '21', '20', '19'];
  currentVersion: string = '23';
  versionData: Map<string, ProcessedPlayer[]> = new Map();
  isLoading = true;
  private autoSlideInterval: any;

  constructor(
    private playersService: PlayersService,
    private utilsService: UtilsService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllVersions();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  loadAllVersions(): void {
    let loadedVersions = 0;
    const totalVersions = this.fifaVersions.length;

    this.fifaVersions.forEach(version => {
      this.playersService.getPlayers({ 
        limit: 6, 
        sortBy: 'overall', 
        sortOrder: 'desc', 
        fifa_version: version 
      }).subscribe({
        next: (response) => {
          const processedPlayers = response.players.map(player => ({
            ...player,
            imageUrl: this.utilsService.getPlayerImage(player), // usar UtilsService nuevo update
            mainPosition: this.utilsService.getMainPosition(player) // usar UtilsService nuevo update
          }));
          
          this.versionData.set(version, processedPlayers);
          loadedVersions++;

          if (loadedVersions === totalVersions) {
            this.isLoading = false;
            console.log('Todas las versiones cargadas');
          }
        },
        error: (error) => {
          console.error(`Error cargando jugadores de FIFA ${version}:`, error);
          loadedVersions++;
          
          this.versionData.set(version, []);
          
          if (loadedVersions === totalVersions) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  getCurrentPlayers(): ProcessedPlayer[] {
    return this.versionData.get(this.currentVersion) || [];
  }

  nextVersion(): void {
    const currentIndex = this.fifaVersions.indexOf(this.currentVersion);
    const nextIndex = (currentIndex + 1) % this.fifaVersions.length;
    this.currentVersion = this.fifaVersions[nextIndex];
    this.restartAutoSlide();
  }

  previousVersion(): void {
    const currentIndex = this.fifaVersions.indexOf(this.currentVersion);
    const prevIndex = (currentIndex - 1 + this.fifaVersions.length) % this.fifaVersions.length;
    this.currentVersion = this.fifaVersions[prevIndex];
    this.restartAutoSlide();
  }

  setCurrentVersion(version: string): void {
    this.currentVersion = version;
    this.restartAutoSlide();
  }

  getFifaLogo(version: string): string {
    return `assets/images/fifa/fifa-${version}.png`;
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextVersion();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  restartAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  // metodo mejorado usando UtilsService para colores consistentes
  getPlayerStats(player: Player): { name: string; value: number; color: string }[] {
    const relevantStats = this.utilsService.getRelevantStats(player);
    
    return relevantStats.slice(0, 4);
  }

  getOverallColor(overall: number): string {
    return this.utilsService.getStatColor(overall);
  }

  viewPlayer(playerId: number): void {
    this.router.navigate(['/player', playerId]); 
  }

  playVideo(): void {
    if (this.heroVideo) {
      this.heroVideo.nativeElement.play();
    }
  }

  pauseVideo(): void {
    if (this.heroVideo) {
      this.heroVideo.nativeElement.pause();
    }
  }
}