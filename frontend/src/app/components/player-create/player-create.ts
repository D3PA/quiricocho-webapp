import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service';
import { Player } from '../../interfaces/player';

@Component({
  selector: 'app-player-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  templateUrl: './player-create.html',
  styleUrls: ['./player-create.scss']
})
export class PlayerCreateComponent implements OnInit {
  createForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  
  nationalities: string[] = [];
  clubs: string[] = [];
  positions: string[] = [];
  bodyTypes: string[] = [];
  workRates: string[] = [];
  allPlayerTraits: string[] = [];
  filteredTraits: string[] = [];
  
  fifaVersions: string[] = ['15', '16', '17', '18', '19', '20', '21', '22', '23'];
  
  // configuracion de habilidades completa
  skillCategories = [
    {
      name: 'Habilidades Principales',
      icon: 'star',
      skills: [
        { key: 'pace', label: 'Ritmo', min: 0, max: 100, category: 'principal' },
        { key: 'shooting', label: 'Tiro', min: 0, max: 100, category: 'principal' },
        { key: 'passing', label: 'Pase', min: 0, max: 100, category: 'principal' },
        { key: 'dribbling', label: 'Regate', min: 0, max: 100, category: 'principal' },
        { key: 'defending', label: 'Defensa', min: 0, max: 100, category: 'principal' },
        { key: 'physic', label: 'Físico', min: 0, max: 100, category: 'principal' }
      ]
    },
    {
      name: 'Ataque',
      icon: 'sports_soccer',
      skills: [
        { key: 'attacking_crossing', label: 'Centros', min: 0, max: 100, category: 'ataque' },
        { key: 'attacking_finishing', label: 'Definición', min: 0, max: 100, category: 'ataque' },
        { key: 'attacking_heading_accuracy', label: 'Cabeza', min: 0, max: 100, category: 'ataque' },
        { key: 'attacking_short_passing', label: 'Pase Corto', min: 0, max: 100, category: 'ataque' },
        { key: 'attacking_volleys', label: 'Voleas', min: 0, max: 100, category: 'ataque' }
      ]
    },
    {
      name: 'Técnica',
      icon: 'style',
      skills: [
        { key: 'skill_dribbling', label: 'Regate Técnico', min: 0, max: 100, category: 'skill' },
        { key: 'skill_curve', label: 'Efecto', min: 0, max: 100, category: 'skill' },
        { key: 'skill_fk_accuracy', label: 'Faltas', min: 0, max: 100, category: 'skill' },
        { key: 'skill_long_passing', label: 'Pase Largo', min: 0, max: 100, category: 'skill' },
        { key: 'skill_ball_control', label: 'Control', min: 0, max: 100, category: 'skill' }
      ]
    },
    {
      name: 'Movimiento',
      icon: 'directions_run',
      skills: [
        { key: 'movement_acceleration', label: 'Aceleración', min: 0, max: 100, category: 'movimiento' },
        { key: 'movement_sprint_speed', label: 'Velocidad', min: 0, max: 100, category: 'movimiento' },
        { key: 'movement_agility', label: 'Agilidad', min: 0, max: 100, category: 'movimiento' },
        { key: 'movement_reactions', label: 'Reacciones', min: 0, max: 100, category: 'movimiento' },
        { key: 'movement_balance', label: 'Equilibrio', min: 0, max: 100, category: 'movimiento' }
      ]
    },
    {
      name: 'Fuerza',
      icon: 'fitness_center',
      skills: [
        { key: 'power_shot_power', label: 'Potencia Tiro', min: 0, max: 100, category: 'fuerza' },
        { key: 'power_jumping', label: 'Salto', min: 0, max: 100, category: 'fuerza' },
        { key: 'power_stamina', label: 'Resistencia', min: 0, max: 100, category: 'fuerza' },
        { key: 'power_strength', label: 'Fuerza', min: 0, max: 100, category: 'fuerza' },
        { key: 'power_long_shots', label: 'Tiros Lejanos', min: 0, max: 100, category: 'fuerza' }
      ]
    },
    {
      name: 'Mentalidad',
      icon: 'psychology',
      skills: [
        { key: 'mentality_aggression', label: 'Agresividad', min: 0, max: 100, category: 'mentalidad' },
        { key: 'mentality_interceptions', label: 'Intercepciones', min: 0, max: 100, category: 'mentalidad' },
        { key: 'mentality_positioning', label: 'Posicionamiento', min: 0, max: 100, category: 'mentalidad' },
        { key: 'mentality_vision', label: 'Visión', min: 0, max: 100, category: 'mentalidad' },
        { key: 'mentality_penalties', label: 'Penales', min: 0, max: 100, category: 'mentalidad' },
        { key: 'mentality_composure', label: 'Compostura', min: 0, max: 100, category: 'mentalidad' }
      ]
    },
    {
      name: 'Defensa',
      icon: 'shield',
      skills: [
        { key: 'defending_marking', label: 'Marcaje', min: 0, max: 100, category: 'defensa' },
        { key: 'defending_standing_tackle', label: 'Entrada Parada', min: 0, max: 100, category: 'defensa' },
        { key: 'defending_sliding_tackle', label: 'Entrada Deslizante', min: 0, max: 100, category: 'defensa' }
      ]
    },
    {
      name: 'Arquero',
      icon: 'sports',
      skills: [
        { key: 'goalkeeping_diving', label: 'Estiradas', min: 0, max: 100, category: 'arquero' },
        { key: 'goalkeeping_handling', label: 'Juego Aéreo', min: 0, max: 100, category: 'arquero' },
        { key: 'goalkeeping_kicking', label: 'Saques', min: 0, max: 100, category: 'arquero' },
        { key: 'goalkeeping_positioning', label: 'Salidas', min: 0, max: 100, category: 'arquero' },
        { key: 'goalkeeping_reflexes', label: 'Reflejos', min: 0, max: 100, category: 'arquero' },
        { key: 'goalkeeping_speed', label: 'Velocidad Arquero', min: 0, max: 100, category: 'arquero' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private playersService: PlayersService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
  }

  compareStrings(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  initForm(): void {
    this.createForm = this.fb.group({
      // informacion basica
      long_name: ['', [Validators.required, Validators.minLength(2)]],
      player_positions: ['', [Validators.required]],
      position_1: [''],
      position_2: [''],
      position_3: [''],
      club_name: [''],
      nationality_name: [''],
      fifa_version: ['all'],
      
      // datos fisicos
      age: [20, [Validators.min(16), Validators.max(60)]],
      height_cm: [180, [Validators.min(150), Validators.max(220)]],
      weight_kg: [75, [Validators.min(50), Validators.max(120)]],
      body_type: ['Normal'],
      preferred_foot: ['Right'],
      
      // ratings principales
      overall: [65, [Validators.min(0), Validators.max(100)]],
      potential: [70, [Validators.min(0), Validators.max(100)]],
      
      // caracteristicas especiales
      weak_foot: [3, [Validators.min(1), Validators.max(5)]],
      skill_moves: [3, [Validators.min(1), Validators.max(5)]],
      international_reputation: [1, [Validators.min(1), Validators.max(5)]],
      work_rate: ['Medium/Medium'],
      
      // player traits (chips)
      player_traits: [''],
      selectedTraits: this.fb.array([]),
      
      // datos financieros
      value_eur: [1000000],
      wage_eur: [10000]
    });

    // inicializar todas las habilidades
    this.skillCategories.forEach(category => {
      category.skills.forEach(skill => {
        const defaultValue = category.name === 'Portero' ? 15 : 50;
        this.createForm.addControl(skill.key, this.fb.control(defaultValue, [Validators.min(0), Validators.max(100)]));
      });
    });

    this.createForm.get('position_1')?.valueChanges.subscribe(() => this.updatePositions());
    this.createForm.get('position_2')?.valueChanges.subscribe(() => this.updatePositions());
    this.createForm.get('position_3')?.valueChanges.subscribe(() => this.updatePositions());
  }

  get selectedTraits(): FormArray {
    return this.createForm.get('selectedTraits') as FormArray;
  }

  addTrait(event: any): void {
    const value = (event.option?.value || '').trim();
    if (value && !this.selectedTraits.controls.some(control => control.value === value)) {
      this.selectedTraits.push(this.fb.control(value));
    }
    this.createForm.patchValue({ player_traits: '' });
    this.filteredTraits = [...this.allPlayerTraits];
  }

  removeTrait(index: number): void {
    this.selectedTraits.removeAt(index);
  }

  filterTraits(event: any): void {
    const value = (event.target?.value || '').toLowerCase();
    if (!value) {
      this.filteredTraits = [...this.allPlayerTraits];
      return;
    }
    this.filteredTraits = this.allPlayerTraits.filter(trait => 
      trait.toLowerCase().includes(value)
    );
  }

  updatePositions(): void {
    const pos1 = this.createForm.get('position_1')?.value;
    const pos2 = this.createForm.get('position_2')?.value;
    const pos3 = this.createForm.get('position_3')?.value;
    
    const positions = [pos1, pos2, pos3].filter(pos => pos && pos !== '').join(', ');
    this.createForm.patchValue({ player_positions: positions });
  }

  loadDropdownData(): void {
    this.isLoading = true;
    this.playersService.getPlayers({ limit: 1000 }).subscribe({
      next: (response) => {
        // extraer datos unicos de la DB
        const players = response.players;
        
        this.nationalities = [...new Set(players
          .map(p => p.nationality_name)
          .filter(n => n && n.trim() !== '')
        )].sort();

        this.clubs = [...new Set(players
          .map(p => p.club_name)
          .filter(c => c && c.trim() !== '')
        )].sort();

        this.positions = [...new Set(players
          .map(p => p.player_positions?.split(',').map(pos => pos.trim()))
          .flat()
          .filter(p => p && p.trim() !== '')
        )].sort();

        this.bodyTypes = [...new Set(players
          .map(p => p.body_type)
          .filter(b => b && b.trim() !== '')
        )].sort();

        this.workRates = [...new Set(players
          .map(p => p.work_rate)
          .filter(w => w && w.trim() !== '')
        )].sort();

        this.allPlayerTraits = [...new Set(players
          .map(p => p.player_traits?.split(',').map(trait => trait.trim()))
          .flat()
          .filter(t => t && t.trim() !== '' && t !== 'NA')
        )].sort();
        
        this.filteredTraits = [...this.allPlayerTraits];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando datos iniciales:', error);
        this.isLoading = false;
      }
    });
  }

  getStatColor(value: number): string {
    return this.utilsService.getStatColor(value);
  }

  getSkillValue(skillKey: string): number {
    return this.createForm.get(skillKey)?.value || 0;
  }

  onSkillChange(skillKey: string, event: any): void {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      this.createForm.get(skillKey)?.setValue(Math.max(0, Math.min(100, value)));
    }
  }

  getStars(max: number): number[] {
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      this.isSubmitting = true;

      // preparar datos para enviar
      const formData = { ...this.createForm.value };
      
      // combinar traits seleccionados
      const traits = this.selectedTraits.controls.map(control => control.value).join(', ');
      formData.player_traits = traits;
      
      // usar imagen por defecto
      formData.player_face_url = 'assets/images/players/default-player.png';
      
      // configurar fifa_update
      formData.fifa_update = 'Custom';
      
      // remover campos temporales
      delete formData.position_1;
      delete formData.position_2;
      delete formData.position_3;
      delete formData.selectedTraits;
      
      const selectedVersion = this.createForm.get('fifa_version')?.value;

      if (selectedVersion === 'all') {
        this.createPlayersInAllVersions(formData);
      } else {
        formData.fifa_version = selectedVersion;
        this.createSinglePlayer(formData);
      }
    }
  }

  private createSinglePlayer(playerData: any): void {
    console.log('Creando jugador con datos:', playerData); // debug
    
    this.playersService.createPlayer(playerData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showSuccess(`Jugador creado exitosamente en FIFA ${playerData.fifa_version}`);
        this.router.navigate(['/player', response.player.id]);
      },
      error: (error) => {
        console.error('Error creando jugador:', error);
        this.isSubmitting = false;
        this.showError('Error al crear el jugador: ' + (error.error?.error || error.message));
      }
    });
  }

  private createPlayersInAllVersions(basePlayerData: any): void {
    // borrar cualquier versión que pueda estar en los datos base
    const { fifa_version, ...cleanBaseData } = basePlayerData;
    
    let createdCount = 0;
    let totalVersions = this.fifaVersions.length;
    let firstPlayerId: string | null = null;
    
    // crear jugadores secuencialmente para evitar sobrecarga
    const createNextPlayer = (index: number) => {
      if (index >= totalVersions) {
        // todos los jugadores creados
        this.isSubmitting = false;
        this.showSuccess(`${createdCount} jugadores creados exitosamente en ${totalVersions} versiones de FIFA`);
        
        if (firstPlayerId) {
          this.router.navigate(['/player', firstPlayerId]);
        } else {
          this.router.navigate(['/players']);
        }
        return;
      }

      const version = this.fifaVersions[index];
      const playerData = { 
        ...cleanBaseData, 
        fifa_version: version 
      };

      this.playersService.createPlayer(playerData).subscribe({
        next: (response) => {
          createdCount++;
          console.log(`Jugador creado en FIFA ${version} con ID: ${response.player.id}`);
          
          // guardar el ID del primer jugador creado (FIFA 15)
          if (index === 0) {
            firstPlayerId = response.player.id;
          }
          
          // crear el siguiente jugador despues de un pequeño delay
          setTimeout(() => createNextPlayer(index + 1), 100);
        },
        error: (error) => {
          console.error(`Error creando jugador en FIFA ${version}:`, error);
          
          // continuar con la siguiente version incluso si hay error
          setTimeout(() => createNextPlayer(index + 1), 100);
        }
      });
    };

    // empezar a crear jugadores
    createNextPlayer(0);
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return '€' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '€' + (value / 1000).toFixed(0) + 'K';
    }
    return '€' + value;
  }

  getVersionDisplay(version: string): string {
    if (version === 'all') return 'Todas las versiones (15-23)';
    return `FIFA ${version}`;
  }
}