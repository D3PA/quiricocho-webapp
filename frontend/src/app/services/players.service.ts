import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player, PlayersResponse, PlayerFilters } from '../interfaces/player';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  private apiUrl = 'http://localhost:3000/api/players';

  constructor(private http: HttpClient) { }

  getPlayers(filters: PlayerFilters = {}): Observable<PlayersResponse> {
    let params = new HttpParams();
    
    if (filters.search) params = params.set('search', filters.search);
    if (filters.club) params = params.set('club', filters.club);
    if (filters.position) params = params.set('position', filters.position);
    if (filters.nationality) params = params.set('nationality', filters.nationality);
    if (filters.fifa_version) params = params.set('fifa_version', filters.fifa_version);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<PlayersResponse>(this.apiUrl, { params });
  }

  // metodo para busqueda rapida
  searchPlayers(searchTerm: string, fifaVersion: string = 'all'): Observable<Player[]> {
    let params = new HttpParams()
      .set('search', searchTerm)
      .set('limit', '50');
    
    if (fifaVersion !== 'all') {
      params = params.set('fifa_version', fifaVersion);
    }

    return this.http.get<PlayersResponse>(this.apiUrl, { params })
      .pipe(
        map(response => response.players) 
      );
  }

  getPlayerById(id: number): Observable<{ player: Player }> {
    return this.http.get<{ player: Player }>(`${this.apiUrl}/${id}`);
  }

  updatePlayer(id: number, playerData: Partial<Player>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, playerData);
  }

  createPlayer(playerData: Partial<Player>): Observable<any> {
    return this.http.post(this.apiUrl, playerData);
  }

  getPlayerTimeline(playerId: number, skill: string = 'overall'): Observable<any> {
    return this.http.get(`${this.apiUrl}/${playerId}/timeline?skill=${skill}`);
  }

  exportToCSV(filters: PlayerFilters = {}): Observable<Blob> {
    let params = new HttpParams();
    
    if (filters.search) params = params.set('search', filters.search);
    if (filters.club) params = params.set('club', filters.club);
    if (filters.position) params = params.set('position', filters.position);
    if (filters.nationality) params = params.set('nationality', filters.nationality);

    return this.http.get(`${this.apiUrl}/export/csv`, { 
      params, 
      responseType: 'blob' 
    });
  }
}