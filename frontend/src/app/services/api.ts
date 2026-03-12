import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

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

  // Health check
  health(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Register user
  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, {
      email,
      password
    });
  }

  // Login user
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, {
      email,
      password
    });
  }

  // Get events
  getEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/events`);
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, {
      headers: this.authHeaders(),
    });
  }

  myPredictions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/predictions/me`, {
      headers: this.authHeaders(),
    });
  }

  // Get markets for a specific event
getMarkets(eventId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/events/${eventId}/markets`);
}

getEvent(eventId: number) {
  return this.http.get(`${this.baseUrl}/events/${eventId}`);
}

getMarket(marketId: number) {
  return this.http.get(`${this.baseUrl}/markets/${marketId}`);
}

submitPrediction(marketId: number, selection: string, stake: number) {
  return this.http.post(
    `${this.baseUrl}/predictions`,
    { market_id: marketId, selection, stake },
    { headers: this.authHeaders() }
  );
}

}
