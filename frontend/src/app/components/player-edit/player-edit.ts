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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { PlayersService } from '../../services/players.service';
import { UtilsService } from '../../services/utils.service';
import { Player } from '../../interfaces/player';
import { ConfirmationModalComponent, ChangesData } from '../confirmation-modal/confirmation-modal';

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
  styleUrls: ['./player-edit.scss']
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

  private originalPlayerData: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playersService: PlayersService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
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
      age: [20, [Validators.min(16), Validators.max(60)]],
      height_cm: [180, [Validators.min(150), Validators.max(220)]],
      weight_kg: [75, [Validators.min(50), Validators.max(120)]],
      body_type: ['Normal'],
      preferred_foot: ['Right'],
      
      // ratings principales
      overall: [65, [Validators.min(0), Validators.max(100)]],
      potential: [70, [Validators.min(0), Validators.max(100)]],
      
      // características especiales
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
        this.editForm.addControl(skill.key, this.fb.control(50, [Validators.min(0), Validators.max(100)]));
      });
    });

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
        this.showError('Error cargando datos del formulario');
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
        console.error('Error cargando jugador:', error);
        this.showError('Error cargando información del jugador');
        this.isLoading = false;
      }
    });
  }

  populateForm(): void {
    if (!this.player) return;

    this.editForm.patchValue({
      long_name: this.player.long_name || '',
      player_positions: this.player.player_positions || '',
      club_name: this.player.club_name || '',
      nationality_name: this.player.nationality_name || '',
      age: this.player.age || 20,
      height_cm: this.player.height_cm || 180,
      weight_kg: this.player.weight_kg || 75,
      body_type: this.player.body_type || 'Normal',
      preferred_foot: this.player.preferred_foot || 'Right',
      overall: this.player.overall || 65,
      potential: this.player.potential || 70,
      weak_foot: this.player.weak_foot || 3,
      skill_moves: this.player.skill_moves || 3,
      international_reputation: this.player.international_reputation || 1,
      work_rate: this.player.work_rate || 'Medium/Medium',
      value_eur: this.player.value_eur || 1000000,
      wage_eur: this.player.wage_eur || 10000
    });

    if (this.player.player_positions) {
      const positions = this.player.player_positions.split(',').map(p => p.trim());
      this.editForm.patchValue({
        position_1: positions[0] || '',
        position_2: positions[1] || '',
        position_3: positions[2] || ''
      });
    }

    this.selectedTraits.clear();
    if (this.player.player_traits) {
      const traits = this.player.player_traits.split(',').map(t => t.trim()).filter(t => t && t !== 'NA');
      traits.forEach(trait => {
        this.selectedTraits.push(this.fb.control(trait));
      });
    }

    // Procesar TODAS las habilidades
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

    // TODOS los campos posibles a comparar (incluyendo todas las habilidades)
    const fieldsToCompare = [
      'long_name', 'player_positions', 'club_name', 'nationality_name',
      'age', 'height_cm', 'weight_kg', 'body_type', 'preferred_foot',
      
      'overall', 'potential',
      
      'weak_foot', 'skill_moves', 'international_reputation', 'work_rate',
      
      'value_eur', 'wage_eur'
    ];

    // agregar TODAS las habilidades a comparar
    this.skillCategories.forEach(category => {
      category.skills.forEach(skill => {
        fieldsToCompare.push(skill.key);
      });
    });

    // comparar campos basicos y habilidades
    fieldsToCompare.forEach(field => {
      const original = this.originalPlayerData[field];
      const updated = formData[field];
      
      if (original !== updated && !(original == null && updated == null)) {
        changes.push({
          field: this.getFieldDisplayName(field),
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
        field: 'Player Traits',
        original: originalTraits || 'Vacío',
        updated: updatedTraits || 'Vacío'
      });
    }

    return changes;
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'long_name': 'Nombre',
      'player_positions': 'Posiciones',
      'club_name': 'Club',
      'nationality_name': 'Nacionalidad',
      'age': 'Edad',
      'height_cm': 'Altura',
      'weight_kg': 'Peso',
      'body_type': 'Tipo de Cuerpo',
      'preferred_foot': 'Pierna Hábil',
      'overall': 'Overall',
      'potential': 'Potencial',
      'weak_foot': 'Pierna Mala',
      'skill_moves': 'Skill Moves',
      'international_reputation': 'Reputación Internacional',
      'work_rate': 'Work Rate',
      'value_eur': 'Valor de Mercado',
      'wage_eur': 'Salario Semanal'
    };

    // para habilidades, buscar en las categorías
    if (!fieldNames[field]) {
      for (const category of this.skillCategories) {
        const skill = category.skills.find(s => s.key === field);
        if (skill) {
          return skill.label;
        }
      }
    }

    return fieldNames[field] || field;
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
        this.showSuccess('No se detectaron cambios');
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
        this.showSuccess('Jugador actualizado exitosamente');
        this.router.navigate(['/player', this.player?.id]);
      },
      error: (error) => {
        console.error('Error actualizando jugador:', error);
        this.isSubmitting = false;
        this.showError('Error al actualizar el jugador: ' + (error.error?.error || error.message));
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
}