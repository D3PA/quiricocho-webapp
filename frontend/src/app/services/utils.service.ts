import { Injectable } from '@angular/core';
import { Player } from '../interfaces/player';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  // mapeo de jugadores top con sus imagenes
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

  // colores segun el rango de habilidades
  private statColors = {
    low: '#d00000',      // 0-49
    belowAverage: '#ff7f00', // 50-64
    average: '#ffd700',     // 65-74
    good: '#9acd32',       // 75-79
    veryGood: '#00c851',   // 80-89
    elite: '#007e33'       // 90-100
  };

  getPlayerImage(player: Player): string {
    // buscar en el mapeo de jugadores top
    for (const [ids, imagePath] of this.playerImageMappings) {
      if (ids.includes(player.id)) {
        return imagePath;
      }
    }
    
    // para otros jugadores, usar imagen generica
    return 'assets/images/players/default-player.png';
  }

  getStatColor(value: number): string {
    if (value <= 49) return this.statColors.low;
    if (value <= 64) return this.statColors.belowAverage;
    if (value <= 74) return this.statColors.average;
    if (value <= 79) return this.statColors.good;
    if (value <= 89) return this.statColors.veryGood;
    return this.statColors.elite;
  }

  getRelevantStats(player: Player): { name: string; value: number; color: string }[] {
    const isGoalkeeper = player.player_positions?.includes('GK');
    const isDefender = player.player_positions?.includes('CB') || 
                      player.player_positions?.includes('RB') || 
                      player.player_positions?.includes('LB') ||
                      player.player_positions?.includes('WB');
    const isMidfielder = player.player_positions?.includes('CM') || 
                        player.player_positions?.includes('CDM') || 
                        player.player_positions?.includes('CAM');

    if (isGoalkeeper) {
      return [
        { name: 'Paradas', value: player.goalkeeping_diving || 0, color: this.getStatColor(player.goalkeeping_diving || 0) },
        { name: 'Reflejos', value: player.goalkeeping_reflexes || 0, color: this.getStatColor(player.goalkeeping_reflexes || 0) },
        { name: 'Salidas', value: player.goalkeeping_positioning || 0, color: this.getStatColor(player.goalkeeping_positioning || 0) },
        { name: 'Juego aéreo', value: player.goalkeeping_handling || 0, color: this.getStatColor(player.goalkeeping_handling || 0) }
      ];
    } else if (isDefender) {
      return [
        { name: 'Defensa', value: player.defending || 0, color: this.getStatColor(player.defending || 0) },
        { name: 'Físico', value: player.physic || 0, color: this.getStatColor(player.physic || 0) },
        { name: 'Ritmo', value: player.pace || 0, color: this.getStatColor(player.pace || 0) },
        { name: 'Pase', value: player.passing || 0, color: this.getStatColor(player.passing || 0) }
      ];
    } else if (isMidfielder) {
      return [
        { name: 'Pase', value: player.passing || 0, color: this.getStatColor(player.passing || 0) },
        { name: 'Regate', value: player.dribbling || 0, color: this.getStatColor(player.dribbling || 0) },
        { name: 'Visión', value: player.mentality_vision || 0, color: this.getStatColor(player.mentality_vision || 0) },
        { name: 'Tiro lejano', value: player.power_long_shots || 0, color: this.getStatColor(player.power_long_shots || 0) }
      ];
    } else {
      // delanteros
      return [
        { name: 'Ritmo', value: player.pace || 0, color: this.getStatColor(player.pace || 0) },
        { name: 'Tiro', value: player.shooting || 0, color: this.getStatColor(player.shooting || 0) },
        { name: 'Regate', value: player.dribbling || 0, color: this.getStatColor(player.dribbling || 0) },
        { name: 'Definición', value: player.attacking_finishing || 0, color: this.getStatColor(player.attacking_finishing || 0) }
      ];
    }
  }

  getMainPosition(player: Player): string {
    return player.player_positions?.split(',')[0]?.trim() || 'N/A';
  }
}