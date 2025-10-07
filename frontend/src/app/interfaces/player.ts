export interface Player {
  id: number;
  fifa_version: string;
  fifa_update: string;
  player_face_url: string;
  long_name: string;
  player_positions: string;
  club_name: string;
  nationality_name: string;
  overall: number;
  potential: number;
  value_eur: number;
  wage_eur: number;
  age: number;
  height_cm: number;
  weight_kg: number;
  preferred_foot: string;
  weak_foot: number;
  skill_moves: number;
  international_reputation: number;
  work_rate: string;
  body_type: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
}

export interface PlayersResponse {
  players: Player[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PlayerFilters {
  search?: string;
  club?: string;
  position?: string;
  nationality?: string;
  page?: number;
  limit?: number;
}