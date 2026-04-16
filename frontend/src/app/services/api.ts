import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {

  private baseUrl = environment.production
    ? environment.apiBaseUrl
    : `http://${window.location.hostname}:3000`;

  constructor(private http: HttpClient) {}

  // --- User token ---

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // --- Admin key ---

  setAdminKey(key: string) {
    localStorage.setItem('admin_key', key);
  }

  getAdminKey(): string | null {
    return localStorage.getItem('admin_key');
  }

  clearAdminKey() {
    localStorage.removeItem('admin_key');
  }

  private adminHeaders(): HttpHeaders {
    const key = this.getAdminKey();
    return key
      ? new HttpHeaders({ 'x-admin-key': key })
      : new HttpHeaders();
  }

  // --- Auth ---

  health(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, {
      email,
      username,
      password
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, {
      email,
      password
    });
  }

  // --- User ---

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, {
      headers: this.authHeaders(),
    });
  }

  myStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/stats`, {
      headers: this.authHeaders(),
    });
  }

  myCreditLog(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/credit-log`, {
      headers: this.authHeaders(),
    });
  }

  // --- Events ---

  getEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/events`);
  }

  getEvent(eventId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/${eventId}`);
  }

  // --- Markets ---

  getMarkets(eventId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/${eventId}/markets`);
  }

  getMarket(marketId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/markets/${marketId}`);
  }

  getMarketOptions(marketId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/markets/${marketId}/options`);
  }

  // --- Predictions ---

  submitPrediction(marketId: number, selection: string, stake: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/predictions`,
      { market_id: marketId, selection, stake },
      { headers: this.authHeaders() }
    );
  }

  myPredictions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/predictions/me`, {
      headers: this.authHeaders(),
    });
  }

  // --- Leaderboard ---

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaderboard`);
  }

  // --- Admin ---

  adminAutoLock(): Observable<any> {
    return this.http.post(`${this.baseUrl}/markets/auto-lock`, {}, {
      headers: this.adminHeaders(),
    });
  }

  adminResolveMarket(marketId: number, result: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/markets/${marketId}/resolve`, { result }, {
      headers: this.adminHeaders(),
    });
  }

  adminGetStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/stats`, {
      headers: this.adminHeaders(),
    });
  }

  adminGetMarkets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/markets`, {
      headers: this.adminHeaders(),
    });
  }

  adminCreateEvent(sport: string, name: string, starts_at: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/events`, { sport, name, starts_at }, {
      headers: this.adminHeaders(),
    });
  }

  adminDeleteMarket(marketId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/admin/markets/${marketId}`, {
    headers: this.adminHeaders(),
  });
}

 adminCreateMarkets(eventId: number, markets: any[], team1?: string, team2?: string): Observable<any> {
  const body: any = { markets };
  if (team1) body.team1 = team1;
  if (team2) body.team2 = team2;
    return this.http.post(`${this.baseUrl}/admin/events/${eventId}/markets`, body, {
    headers: this.adminHeaders(),
    });
  }


}