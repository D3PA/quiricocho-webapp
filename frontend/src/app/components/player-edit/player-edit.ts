import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatDialog } from '@angular/material/dialog';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service';
import { Player } from '../../interfaces/player';
import { ConfirmationModalComponent, ChangesData } from '../confirmation-modal/confirmation-modal';

interface SkillConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  category: string;
}

@Component({
  selector: 'app-player-edit',
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
  templateUrl: './player-edit.html',
  styleUrl: './player-edit.scss'
})
export class PlayerEditComponent implements OnInit {
  editForm!: FormGroup;
  player: Player | null = null;
  isLoading = true;
  isSubmitting = false;
  
  // datos para los selects (desde DB)
  nationalities: string[] = [];
  clubs: string[] = [];
  positions: string[] = [];
  bodyTypes: string[] = [];
  workRates: string[] = [];
  allPlayerTraits: string[] = [];
  filteredTraits: string[] = [];
  
  // fecha de nacimiento
  days: number[] = Array.from({length: 31}, (_, i) => i + 1);
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  years: number[] = Array.from({length: 69}, (_, i) => 2008 - i);

  // configuracion de habilidades optimizada
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
    }
  ];

  private originalPlayerData: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playersService: PlayersService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  compareStrings(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  initForm(): void {
    this.editForm = this.fb.group({
      // informacion basica
      long_name: ['', [Validators.required, Validators.minLength(2)]],
      player_positions: ['', [Validators.required]],
      position_1: [''],
      position_2: [''],
      position_3: [''],
      club_name: [''],
      nationality_name: [''],
      
      // datos fisicos
      age: [16, [Validators.min(16), Validators.max(60)]],
      height_cm: [170, [Validators.min(150), Validators.max(220)]],
      weight_kg: [70, [Validators.min(50), Validators.max(120)]],
      body_type: ['Normal'],
      preferred_foot: ['Right'],
      
      // ratings principales
      overall: [50, [Validators.min(0), Validators.max(100)]],
      potential: [50, [Validators.min(0), Validators.max(100)]],
      
      // caracteristicas especiales
      weak_foot: [3, [Validators.min(1), Validators.max(5)]],
      skill_moves: [3, [Validators.min(1), Validators.max(5)]],
      international_reputation: [1, [Validators.min(1), Validators.max(5)]],
      work_rate: ['Medium/Medium'],
      
      // player traits (chips)
      player_traits: [''],
      selectedTraits: this.fb.array([]),
      
      // datos financieros
      value_eur: [0],
      wage_eur: [0]
    });

    // inicializar todas las habilidades
    this.skillCategories.forEach(category => {
      category.skills.forEach(skill => {
        this.editForm.addControl(skill.key, this.fb.control(50, [Validators.min(0), Validators.max(100)]));
      });
    });

    // suscribirse a cambios en las posiciones
    this.editForm.get('position_1')?.valueChanges.subscribe(() => this.updatePositions());
    this.editForm.get('position_2')?.valueChanges.subscribe(() => this.updatePositions());
    this.editForm.get('position_3')?.valueChanges.subscribe(() => this.updatePositions());
  }

  get selectedTraits(): FormArray {
    return this.editForm.get('selectedTraits') as FormArray;
  }

  addTrait(event: any): void {
    const value = (event.option?.value || '').trim();
    if (value && !this.selectedTraits.controls.some(control => control.value === value)) {
      this.selectedTraits.push(this.fb.control(value));
    }
    // limpiar el input 
    this.editForm.patchValue({ player_traits: '' });
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
    const pos1 = this.editForm.get('position_1')?.value;
    const pos2 = this.editForm.get('position_2')?.value;
    const pos3 = this.editForm.get('position_3')?.value;
    
    const positions = [pos1, pos2, pos3].filter(pos => pos && pos !== '').join(', ');
    this.editForm.patchValue({ player_positions: positions });
  }

  loadInitialData(): void {
    this.loadDropdownData();
    this.loadPlayerData();
  }

  loadDropdownData(): void {
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
      },
      error: (error) => {
        console.error('Error cargando datos iniciales:', error);
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
        // GUARDAR DATOS ORIGINALES
        this.originalPlayerData = { ...response.player };
        this.populateForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading player:', error);
        this.isLoading = false;
      }
    });
  }

  populateForm(): void {
    if (!this.player) return;

    // informacion basica
    this.editForm.patchValue({
      long_name: this.player.long_name || '',
      player_positions: this.player.player_positions || '',
      club_name: this.player.club_name || '',
      nationality_name: this.player.nationality_name || '',
      age: this.player.age || 16,
      height_cm: this.player.height_cm || 170,
      weight_kg: this.player.weight_kg || 70,
      body_type: this.player.body_type || 'Normal',
      preferred_foot: this.player.preferred_foot || 'Right',
      overall: this.player.overall || 50,
      potential: this.player.potential || 50,
      weak_foot: this.player.weak_foot || 3,
      skill_moves: this.player.skill_moves || 3,
      international_reputation: this.player.international_reputation || 1,
      work_rate: this.player.work_rate || 'Medium/Medium',
      value_eur: this.player.value_eur || 0,
      wage_eur: this.player.wage_eur || 0
    });

    // procesar posiciones
    if (this.player.player_positions) {
      const positions = this.player.player_positions.split(',').map(p => p.trim());
      this.editForm.patchValue({
        position_1: positions[0] || '',
        position_2: positions[1] || '',
        position_3: positions[2] || ''
      });
    }

    // procesar traits
    this.selectedTraits.clear();
    if (this.player.player_traits) {
      const traits = this.player.player_traits.split(',').map(t => t.trim()).filter(t => t && t !== 'NA');
      traits.forEach(trait => {
        this.selectedTraits.push(this.fb.control(trait));
      });
    }

    // procesar habilidades
    this.skillCategories.forEach(category => {
      category.skills.forEach(skill => {
        const value = this.player![skill.key as keyof Player] as number;
        if (value !== undefined && value !== null) {
          this.editForm.patchValue({ [skill.key]: value });
        }
      });
    });
  }

  getStatColor(value: number): string {
    return this.utilsService.getStatColor(value);
  }

  getSkillValue(skillKey: string): number {
    return this.editForm.get(skillKey)?.value || 0;
  }

  onSkillChange(skillKey: string, event: any): void {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      this.editForm.get(skillKey)?.setValue(Math.max(0, Math.min(100, value)));
    }
  }

  getStars(max: number): number[] {
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  detectChanges(): { field: string; original: any; updated: any }[] {
    if (!this.player || !this.originalPlayerData) return [];

    const changes: { field: string; original: any; updated: any }[] = [];
    const formData = this.editForm.value;

    // TODOS los campos posibles a comparar
    const fieldsToCompare = [
      // informacion basica
      'long_name', 'player_positions', 'club_name', 'nationality_name',
      'age', 'height_cm', 'weight_kg', 'body_type', 'preferred_foot',
      
      // ratings principales
      'overall', 'potential',
      
      // habilidades principales
      'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic',
      
      // caracteristicas especiales
      'weak_foot', 'skill_moves', 'international_reputation', 'work_rate',
      
      // habilidades de ataque
      'attacking_crossing', 'attacking_finishing', 'attacking_heading_accuracy', 
      'attacking_short_passing', 'attacking_volleys',
      
      // habilidades tecnicas
      'skill_dribbling', 'skill_curve', 'skill_fk_accuracy', 
      'skill_long_passing', 'skill_ball_control',
      
      // habilidades de movimiento
      'movement_acceleration', 'movement_sprint_speed', 'movement_agility',
      'movement_reactions', 'movement_balance',
      
      // datos financieros
      'value_eur', 'wage_eur'
    ];

    // comparar campos basicos y habilidades
    fieldsToCompare.forEach(field => {
      const original = this.originalPlayerData[field];
      const updated = formData[field];
      
      if (original !== updated && !(original == null && updated == null)) {
        changes.push({
          field,
          original: this.formatValue(original),
          updated: this.formatValue(updated)
        });
      }
    });

    // comparar player_traits
    const originalTraits = this.originalPlayerData.player_traits || '';
    const updatedTraits = this.selectedTraits.controls.map(control => control.value).join(', ');
    
    if (originalTraits !== updatedTraits) {
      changes.push({
        field: 'player_traits',
        original: originalTraits || 'Vacío',
        updated: updatedTraits || 'Vacío'
      });
    }

    return changes;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'Vacío';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return value;
  }

  onSubmit(): void {
    if (this.editForm.valid && this.player) {
      const changes = this.detectChanges();
      
      if (changes.length === 0) {
        this.router.navigate(['/player', this.player.id]);
        return;
      }

      // mostrar modal de confirmacion
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '600px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        panelClass: 'dark-dialog-container',
        data: {
          originalPlayer: this.originalPlayerData,
          updatedPlayer: this.editForm.value,
          changes: changes
        } as ChangesData
      });

      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.saveChanges();
        }
      });
    }
  }

  private saveChanges(): void {
    this.isSubmitting = true;
    
    // preparar datos para enviar
    const formData = { ...this.editForm.value };
    
    // combinar traits seleccionados
    const traits = this.selectedTraits.controls.map(control => control.value).join(', ');
    formData.player_traits = traits;
    
    // remover campos temporales
    delete formData.position_1;
    delete formData.position_2;
    delete formData.position_3;
    delete formData.selectedTraits;
    
    this.playersService.updatePlayer(this.player!.id, formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(['/player', this.player?.id]);
      },
      error: (error) => {
        console.error('Error updating player:', error);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    if (this.player) {
      this.router.navigate(['/player', this.player.id]);
    } else {
      this.router.navigate(['/players']);
    }
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return '€' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '€' + (value / 1000).toFixed(0) + 'K';
    }
    return '€' + value;
  }
}