import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service';
import { Player } from '../../interfaces/player';

// Chart.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface SkillGroup {
  name: string;
  average: number;
  skills: { name: string; value: number; color: string }[];
}

interface TimelinePoint {
  year: string;
  overall: number;
  age: number;
}

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './player-profile.html',
  styleUrl: './player-profile.scss'
})
export class PlayerProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('timelineChart') timelineChartRef!: ElementRef<HTMLCanvasElement>;
  
  player: Player | null = null;
  isLoading = true;
  skillGroups: SkillGroup[] = [];
  timelineData: TimelinePoint[] = [];
  playerTraits: string[] = [];
  isAdmin: boolean = false;
  
  // PROPIEDADES PARA EL SELECTOR DE HABILIDADES
  selectedSkill: string = 'overall';
  availableSkills: { value: string; label: string; category: string }[] = [];
  isTimelineLoading: boolean = false;
  
  private radarChart: Chart | null = null;
  private timelineChart: Chart | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playersService: PlayersService,
    public utilsService: UtilsService,
  ) {}

  ngOnInit(): void {
    this.loadPlayerData();
    this.initializeAvailableSkills();
    this.checkAdminStatus();
  }

  ngAfterViewInit(): void {
    this.initResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.radarChart) {
      this.radarChart.destroy();
    }
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.updateChartsSize();
    }, 250);
  }

  private initResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.updateChartsSize();
    });

    const containers = [
      document.querySelector('.player-profile-container'),
      document.querySelector('.radar-card'),
      document.querySelector('.timeline-card')
    ];

    containers.forEach(container => {
      if (container) {
        this.resizeObserver?.observe(container);
      }
    });
  }

  private updateChartsSize(): void {
    if (this.radarChart) {
      setTimeout(() => {
        this.radarChart?.resize();
        this.radarChart?.update('none');
      }, 100);
    }
    
    if (this.timelineChart) {
      setTimeout(() => {
        this.timelineChart?.resize();
        this.timelineChart?.update('none');
      }, 100);
    }
  }

  get principalSkills() {
    return this.availableSkills.filter(s => s.category === 'Principal');
  }

  get attackSkills() {
    return this.availableSkills.filter(s => s.category === 'Ataque');
  }

  get skillSkills() {
    return this.availableSkills.filter(s => s.category === 'Skill');
  }

  get defenseSkills() {
    return this.availableSkills.filter(s => s.category === 'Defensa');
  }

  get goalkeeperSkills() {
    return this.availableSkills.filter(s => s.category === 'Arquero');
  }

  initializeAvailableSkills(): void {
    this.availableSkills = [
      // habilidades principales
      { value: 'overall', label: 'Overall', category: 'Principal' },
      { value: 'pace', label: 'Ritmo', category: 'Principal' },
      { value: 'shooting', label: 'Tiro', category: 'Principal' },
      { value: 'passing', label: 'Pase', category: 'Principal' },
      { value: 'dribbling', label: 'Regate', category: 'Principal' },
      { value: 'defending', label: 'Defensa', category: 'Principal' },
      { value: 'physic', label: 'Físico', category: 'Principal' },
      
      // habilidades de ataque
      { value: 'attacking_finishing', label: 'Definición', category: 'Ataque' },
      { value: 'attacking_heading_accuracy', label: 'Cabeza', category: 'Ataque' },
      
      // habilidades de skill
      { value: 'skill_dribbling', label: 'Habilidad Regate', category: 'Skill' },
      
      // habilidades de defensa
      { value: 'defending_marking', label: 'Marcaje', category: 'Defensa' },
      { value: 'defending_standing_tackle', label: 'Entrada', category: 'Defensa' },
      
      // habilidades de arquero
      { value: 'goalkeeping_diving', label: 'Paradas', category: 'Arquero' }
    ];
  }

  checkAdminStatus(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.is_admin === true;
  }

  editPlayer(): void {
    if (!this.player) return;
    this.router.navigate(['/player-edit', this.player.id]);
  }

  onSkillChange(): void {
    if (!this.player) return;
    
    this.isTimelineLoading = true;
    
    this.playersService.getPlayerTimeline(this.player.id, this.selectedSkill).subscribe({
      next: (response: any) => {
        if (response.timeline && response.timeline.length > 0) {
          this.timelineData = response.timeline.map((point: any) => ({
            year: point.year,
            overall: point.value,
            age: point.age
          }));
        } else {
          this.timelineData = this.generateFallbackTimelineForSkill(this.selectedSkill);
        }
        
        setTimeout(() => {
          if (this.timelineChart) {
            this.timelineChart.destroy();
          }
          this.initTimelineChart();
          this.isTimelineLoading = false;
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando timeline con nueva habilidad:', error);
        this.timelineData = this.generateFallbackTimelineForSkill(this.selectedSkill);
        
        setTimeout(() => {
          if (this.timelineChart) {
            this.timelineChart.destroy();
          }
          this.initTimelineChart();
          this.isTimelineLoading = false;
        }, 100);
      }
    });
  }

  loadPlayerData(): void {
    const playerId = this.route.snapshot.paramMap.get('id');
    
    if (!playerId) {
      this.router.navigate(['/players']);
      return;
    }

    this.playersService.getPlayerById(+playerId).subscribe({
      next: (response) => {
        this.player = response.player;
        this.processPlayerTraits();
        this.processAllSkillGroups();
        this.loadTimelineData(+playerId);
        this.isLoading = false;
        
        setTimeout(() => {
          this.initRadarChart();
          this.initTimelineChart();
        }, 300);
      },
      error: (error) => {
        console.error('Error loading player:', error);
        this.isLoading = false;
      }
    });
  }

  loadTimelineData(playerId: number): void {
    this.isTimelineLoading = true;
    
    this.playersService.getPlayerTimeline(playerId, this.selectedSkill).subscribe({
      next: (response: any) => {
        if (response.timeline && response.timeline.length > 0) {
          this.timelineData = response.timeline.map((point: any) => ({
            year: point.year,
            overall: point.value,
            age: point.age
          }));
        } else {
          this.timelineData = this.generateFallbackTimelineForSkill(this.selectedSkill);
        }
        
        setTimeout(() => {
          if (this.timelineChart) {
            this.timelineChart.destroy();
          }
          this.initTimelineChart();
          this.isTimelineLoading = false;
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando timeline:', error);
        this.timelineData = this.generateFallbackTimelineForSkill(this.selectedSkill);
        
        setTimeout(() => {
          if (this.timelineChart) {
            this.timelineChart.destroy();
          }
          this.initTimelineChart();
          this.isTimelineLoading = false;
        }, 100);
      }
    });
  }

  generateFallbackTimelineForSkill(skill: string): TimelinePoint[] {
    if (!this.player) return [];

    const baseValue = this.player[skill as keyof Player] as number || 50;
    const baseAge = this.player.age;
    const currentYear = parseInt(this.player.fifa_version);
    
    const timeline: TimelinePoint[] = [];
    const startYear = 2015;
    
    for (let year = startYear; year <= currentYear; year++) {
      const yearsFromCurrent = currentYear - year;
      const age = baseAge - yearsFromCurrent;
      
      const progressFactor = (currentYear - year) / (currentYear - startYear);
      const value = Math.max(
        30, 
        baseValue - (progressFactor * (baseValue - 40))
      );
      
      timeline.push({
        year: year.toString(),
        overall: Math.round(value),
        age: age
      });
    }
    
    return timeline;
  }

  processPlayerTraits(): void {
    if (!this.player?.player_traits) {
      this.playerTraits = [];
      return;
    }

    const traits = this.player.player_traits.split(',').map(trait => trait.trim());
    this.playerTraits = traits.filter(trait => trait && trait !== 'NA');
  }

  processAllSkillGroups(): void {
    if (!this.player) return;

    const player = this.player;
    const isGoalkeeper = player.player_positions?.includes('GK');

    if (isGoalkeeper) {
      this.skillGroups = this.getGoalkeeperSkillGroups(player);
    } else {
      this.skillGroups = this.getOutfieldSkillGroups(player);
    }
  }

  getGoalkeeperSkillGroups(player: Player): SkillGroup[] {
    return [
      {
        name: 'Arquero',
        average: Math.round((player.goalkeeping_diving + player.goalkeeping_handling + player.goalkeeping_positioning + player.goalkeeping_reflexes) / 4),
        skills: [
          { name: 'Paradas', value: player.goalkeeping_diving, color: this.utilsService.getStatColor(player.goalkeeping_diving) },
          { name: 'Reflejos', value: player.goalkeeping_reflexes, color: this.utilsService.getStatColor(player.goalkeeping_reflexes) },
          { name: 'Salidas', value: player.goalkeeping_positioning, color: this.utilsService.getStatColor(player.goalkeeping_positioning) },
          { name: 'Juego aéreo', value: player.goalkeeping_handling, color: this.utilsService.getStatColor(player.goalkeeping_handling) },
          { name: 'Saques', value: player.goalkeeping_kicking, color: this.utilsService.getStatColor(player.goalkeeping_kicking) },
          { name: 'Velocidad', value: player.goalkeeping_speed, color: this.utilsService.getStatColor(player.goalkeeping_speed) }
        ]
      },
      {
        name: 'Físico',
        average: player.physic,
        skills: [
          { name: 'Fuerza', value: player.power_strength, color: this.utilsService.getStatColor(player.power_strength) },
          { name: 'Salto', value: player.power_jumping, color: this.utilsService.getStatColor(player.power_jumping) },
          { name: 'Agilidad', value: player.movement_agility, color: this.utilsService.getStatColor(player.movement_agility) },
          { name: 'Equilibrio', value: player.movement_balance, color: this.utilsService.getStatColor(player.movement_balance) },
          { name: 'Resistencia', value: player.power_stamina, color: this.utilsService.getStatColor(player.power_stamina) }
        ]
      }
    ];
  }

  getOutfieldSkillGroups(player: Player): SkillGroup[] {
    return [
      {
        name: 'Ritmo',
        average: player.pace,
        skills: [
          { name: 'Aceleración', value: player.movement_acceleration, color: this.utilsService.getStatColor(player.movement_acceleration) },
          { name: 'Velocidad', value: player.movement_sprint_speed, color: this.utilsService.getStatColor(player.movement_sprint_speed) },
          { name: 'Agilidad', value: player.movement_agility, color: this.utilsService.getStatColor(player.movement_agility) },
          { name: 'Reacciones', value: player.movement_reactions, color: this.utilsService.getStatColor(player.movement_reactions) }
        ]
      },
      {
        name: 'Tiro',
        average: player.shooting,
        skills: [
          { name: 'Definición', value: player.attacking_finishing, color: this.utilsService.getStatColor(player.attacking_finishing) },
          { name: 'Potencia', value: player.power_shot_power, color: this.utilsService.getStatColor(player.power_shot_power) },
          { name: 'Tiros Lejanos', value: player.power_long_shots, color: this.utilsService.getStatColor(player.power_long_shots) },
          { name: 'Penales', value: player.mentality_penalties, color: this.utilsService.getStatColor(player.mentality_penalties) },
          { name: 'Voleas', value: player.attacking_volleys, color: this.utilsService.getStatColor(player.attacking_volleys) }
        ]
      },
      {
        name: 'Pase',
        average: player.passing,
        skills: [
          { name: 'Visión', value: player.mentality_vision, color: this.utilsService.getStatColor(player.mentality_vision) },
          { name: 'Pase Corto', value: player.attacking_short_passing, color: this.utilsService.getStatColor(player.attacking_short_passing) },
          { name: 'Pase Largo', value: player.skill_long_passing, color: this.utilsService.getStatColor(player.skill_long_passing) },
          { name: 'Centros', value: player.attacking_crossing, color: this.utilsService.getStatColor(player.attacking_crossing) },
          { name: 'Faltas', value: player.skill_fk_accuracy, color: this.utilsService.getStatColor(player.skill_fk_accuracy) },
          { name: 'Efecto', value: player.skill_curve, color: this.utilsService.getStatColor(player.skill_curve) }
        ]
      },
      {
        name: 'Regate',
        average: player.dribbling,
        skills: [
          { name: 'Control', value: player.skill_ball_control, color: this.utilsService.getStatColor(player.skill_ball_control) },
          { name: 'Habilidad', value: player.skill_dribbling, color: this.utilsService.getStatColor(player.skill_dribbling) },
          { name: 'Equilibrio', value: player.movement_balance, color: this.utilsService.getStatColor(player.movement_balance) },
          { name: 'Compostura', value: player.mentality_composure, color: this.utilsService.getStatColor(player.mentality_composure) }
        ]
      },
      {
        name: 'Defensa',
        average: player.defending,
        skills: [
          { name: 'Marcaje', value: player.defending_marking, color: this.utilsService.getStatColor(player.defending_marking) },
          { name: 'Entrada', value: player.defending_standing_tackle, color: this.utilsService.getStatColor(player.defending_standing_tackle) },
          { name: 'Barrida', value: player.defending_sliding_tackle, color: this.utilsService.getStatColor(player.defending_sliding_tackle) },
          { name: 'Intercepciones', value: player.mentality_interceptions, color: this.utilsService.getStatColor(player.mentality_interceptions) },
          { name: 'Cabeza', value: player.attacking_heading_accuracy, color: this.utilsService.getStatColor(player.attacking_heading_accuracy) }
        ]
      },
      {
        name: 'Físico',
        average: player.physic,
        skills: [
          { name: 'Fuerza', value: player.power_strength, color: this.utilsService.getStatColor(player.power_strength) },
          { name: 'Salto', value: player.power_jumping, color: this.utilsService.getStatColor(player.power_jumping) },
          { name: 'Resistencia', value: player.power_stamina, color: this.utilsService.getStatColor(player.power_stamina) },
          { name: 'Agresividad', value: player.mentality_aggression, color: this.utilsService.getStatColor(player.mentality_aggression) }
        ]
      }
    ];
  }

  initRadarChart(): void {
  if (!this.player || !this.radarChartRef) return;

  if (this.radarChart) {
    this.radarChart.destroy();
  }

  const isGoalkeeper = this.player.player_positions?.includes('GK');
  
  const labels = isGoalkeeper 
    ? ['Paradas', 'Reflejos', 'Salidas', 'Juego Aéreo', 'Físico']
    : ['Ritmo', 'Tiro', 'Pase', 'Regate', 'Defensa', 'Físico'];

  const data = isGoalkeeper
    ? [
        this.player.goalkeeping_diving,
        this.player.goalkeeping_reflexes,
        this.player.goalkeeping_positioning,
        this.player.goalkeeping_handling,
        this.player.physic
      ]
    : [
        this.player.pace,
        this.player.shooting,
        this.player.passing,
        this.player.dribbling,
        this.player.defending,
        this.player.physic
      ];

  const canvas = this.radarChartRef.nativeElement;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('No se pudo obtener el contexto 2D del canvas');
    return;
  }

  // obtener el tamaño del contenedor padre para responsive (fix update)
  const container = canvas.parentElement;
  const containerWidth = container?.clientWidth || 300;

  // ajustar tamaño de fuente basado en el ancho del contenedor (fix update)
  const baseFontSize = containerWidth < 400 ? 9 : containerWidth < 600 ? 10 : 11;
  const pointLabelPadding = containerWidth < 400 ? 8 : containerWidth < 600 ? 9 : 10;

  this.radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Habilidades Principales',
        data: data,
        backgroundColor: 'rgba(0, 255, 136, 0.2)',
        borderColor: '#00ff88',
        borderWidth: 2,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: containerWidth < 400 ? 3 : 4,
        pointHoverRadius: containerWidth < 400 ? 5 : 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, 
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }
      },
      animation: {
        duration: 0
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false,
            stepSize: 20,
            backdropColor: 'transparent'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            circular: true
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          pointLabels: {
            color: '#ffffff',
            font: {
              size: 14,
              family: "'Exo 2', sans-serif",
              weight: 'bold'
            },
            padding: pointLabelPadding
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: containerWidth > 350,
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

  initTimelineChart(): void {
    if (!this.timelineChartRef || this.timelineData.length === 0) return;

    try {
      if (this.timelineChart) {
        this.timelineChart.destroy();
      }

      const years = this.timelineData.map(point => `FIFA ${point.year}`);
      const values = this.timelineData.map(point => point.overall);

      const selectedSkillLabel = this.availableSkills.find(skill => skill.value === this.selectedSkill)?.label || 'Overall';

      const canvas = this.timelineChartRef.nativeElement;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('No se pudo obtener el contexto 2D del canvas');
        return;
      }

      const container = canvas.parentElement;
      const containerWidth = container?.clientWidth || 300;

      const baseFontSize = containerWidth < 400 ? 10 : containerWidth < 600 ? 11 : 12;
      const pointRadius = containerWidth < 400 ? 3 : 4;
      const showLegend = containerWidth > 450;

      this.timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: selectedSkillLabel,
            data: values,
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderWidth: containerWidth < 400 ? 2 : 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00ff88',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: pointRadius,
            pointHoverRadius: pointRadius + 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0
          },
          plugins: {
            legend: {
              display: showLegend,
              labels: {
                color: '#ffffff',
                font: {
                  size: baseFontSize,
                  family: "'Exo 2', sans-serif"
                }
              }
            },
            tooltip: {
              enabled: containerWidth > 350,
              callbacks: {
                label: (context) => {
                  return `${selectedSkillLabel}: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#ffffff',
                font: {
                  size: baseFontSize - 1,
                  family: "'Exo 2', sans-serif"
                },
                maxRotation: containerWidth < 500 ? 90 : 45,
                minRotation: containerWidth < 500 ? 90 : 45
              }
            },
            y: {
              beginAtZero: false,
              min: Math.max(0, Math.min(...values) - 5),
              max: Math.min(100, Math.max(...values) + 5),
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#ffffff',
                font: {
                  size: baseFontSize - 1,
                  family: "'Exo 2', sans-serif"
                },
                callback: function(value) {
                  return value;
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });

    } catch (error) {
      console.error('Error inicializando el chart de timeline:', error);
    }
  }

  getWeakFootStars(): string[] {
    if (!this.player) return [];
    return Array(this.player.weak_foot).fill('star');
  }

  getSkillMovesStars(): string[] {
    if (!this.player) return [];
    return Array(this.player.skill_moves).fill('star');
  }

  getInternationalReputationStars(): string[] {
    if (!this.player) return [];
    return Array(this.player.international_reputation).fill('star');
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return '€' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '€' + (value / 1000).toFixed(0) + 'K';
    }
    return '€' + value;
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }

  getMaxOverall(): number {
    if (this.timelineData.length === 0) return 0;
    return Math.max(...this.timelineData.map(point => point.overall));
  }

  getProgress(): number {
    if (this.timelineData.length < 2) return 0;
    const first = this.timelineData[0].overall;
    const last = this.timelineData[this.timelineData.length - 1].overall;
    const progress = last - first;
    
    return Math.round(progress * 10) / 10;
  }
}