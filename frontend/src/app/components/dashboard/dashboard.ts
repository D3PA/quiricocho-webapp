import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { trigger, transition, style, animate } from '@angular/animations';

import { PlayersService } from '../../services/players.service';
import { Player } from '../../interfaces/player';

interface ProcessedPlayer extends Player {
  imageUrl: string;
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

  // versiones de FIFA para el slider
  fifaVersions: string[] = ['23', '22', '21', '20', '19'];  // es posible agregar mas versiones 
  currentVersion: string = '23';
  versionData: Map<string, ProcessedPlayer[]> = new Map();
  isLoading = true;
  private autoSlideInterval: any;

  // mapeo de imagenes para jugadores top
  private playerImageMappings: [number[], string][] = [
    [[143051, 123812, 104925, 86442, 68357, 50429, 32863, 16183, 1], 'assets/images/players/top/messi.png'],
    [[143056, 123814, 104926, 86443, 68356, 50428, 32862, 16184, 2], 'assets/images/players/top/ronaldo.png'],
    [[143055, 123818, 104936, 86464, 68412, 50624, 37486], 'assets/images/players/top/mbappe.png'],
    [[143053, 123813, 104927, 86456, 68368, 50433, 32870, 16205, 19], 'assets/images/players/top/lewandowski.png'],
    [[143054, 123816, 104929, 86446, 68363, 50446, 32890, 16219, 203], 'assets/images/players/top/debruyne.png'],
    [[143059, 123827, 104932, 86450, 68458, 50607, 33525, 1118], 'assets/images/players/top/vandijk.png'],
    [[143061, 123815, 104928, 86444, 68358, 50432, 32866, 16193, 30], 'assets/images/players/top/neymar.png'],
    [[143052, 123823, 104939, 86484, 68475, 50478, 32895, 16210, 35], 'assets/images/players/top/benzema.png'],
    [[143064, 123817, 104930, 86447, 68370, 50459, 32907, 16445, 662], 'assets/images/players/top/oblak.png'],
    [[143151, 123887, 104945, 86445, 68362, 50437, 32888, 16189, 12], 'assets/images/players/top/hazard.png'],
    [[143083, 123918, 104981, 86458, 68364, 50438, 32871, 16220, 98], 'assets/images/players/top/degea.png']
  ];

  constructor(
    private playersService: PlayersService,
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
            imageUrl: this.getPlayerImage(player)
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
          
          // si hay error, simplemente poner array vacio
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
    }, 5000); // 5 segundos
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

  private getPlayerImage(player: Player): string {
    // buscar en el mapeo de jugadores top
    for (const [ids, imagePath] of this.playerImageMappings) {
      if (ids.includes(player.id)) {
        return imagePath;
      }
    }
    
    // para otros jugadores, usar imagen generica
    return 'assets/images/players/default-player.png';
  }

  getPlayerStats(player: Player): any[] {
    const isGoalkeeper = player.player_positions?.includes('GK'); 
    const isDefender = player.player_positions?.includes('CB') || player.player_positions?.includes('RB') || player.player_positions?.includes('LB');
    
    if (isGoalkeeper) {
      return [
        { name: 'Paradas', value: player.goalkeeping_diving || 85 },
        { name: 'Reflejos', value: player.goalkeeping_reflexes || 88 },
        { name: 'Juego aéreo', value: player.goalkeeping_positioning || 82 },
        { name: 'Salidas', value: player.goalkeeping_handling || 80 }
      ];
    } else if (isDefender) {
      return [
        { name: 'Defensa', value: player.defending || 0 },
        { name: 'Físico', value: player.physic || 0 },
        { name: 'Ritmo', value: player.pace || 0 },
        { name: 'Pase', value: player.passing || 0 }
      ];
    } else {
      return [
        { name: 'Ritmo', value: player.pace || 0 },
        { name: 'Tiro', value: player.shooting || 0 },
        { name: 'Pase', value: player.passing || 0 },
        { name: 'Regate', value: player.dribbling || 0 }
      ];
    }
  }

  viewPlayer(playerId: number): void {
    this.router.navigate(['/players', playerId]);
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