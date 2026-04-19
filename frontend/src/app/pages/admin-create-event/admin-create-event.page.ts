import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, arrowBackOutline, settingsOutline, addOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-create-event',
  templateUrl: './admin-create-event.page.html',
  styleUrls: ['./admin-create-event.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class AdminCreateEventPage {

  sport = 'F1';
  name = '';
  startsAt = '';
  markets: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  team1 = '';
  team2 = '';

  sportOptions = [
    { value: 'F1', label: 'Formula 1' },
    { value: 'CRICKET', label: 'Cricket' },
    { value: 'FOOTBALL', label: 'Football' },
  ];

  teamsBySport: { [key: string]: { value: string; label: string }[] } = {
    CRICKET: [
      { value: 'CSK', label: 'Chennai Super Kings' },
      { value: 'MI', label: 'Mumbai Indians' },
      { value: 'RCB', label: 'Royal Challengers Bengaluru' },
      { value: 'KKR', label: 'Kolkata Knight Riders' },
      { value: 'DC', label: 'Delhi Capitals' },
      { value: 'PBKS', label: 'Punjab Kings' },
      { value: 'RR', label: 'Rajasthan Royals' },
      { value: 'SRH', label: 'Sunrisers Hyderabad' },
      { value: 'GT', label: 'Gujarat Titans' },
      { value: 'LSG', label: 'Lucknow Super Giants' },
    ],
    FOOTBALL: [
      { value: 'ARS', label: 'Arsenal' },
      { value: 'AVL', label: 'Aston Villa' },
      { value: 'CHE', label: 'Chelsea' },
      { value: 'LIV', label: 'Liverpool' },
      { value: 'MCI', label: 'Manchester City' },
      { value: 'MUN', label: 'Manchester United' },
      { value: 'NEW', label: 'Newcastle' },
      { value: 'TOT', label: 'Tottenham' },
    ],
  };

  marketTypesBySport: { [key: string]: { value: string; label: string }[] } = {
    F1: [
      { value: 'race_p1', label: 'Race P1 (Winner)' },
      { value: 'race_p2', label: 'Race P2' },
      { value: 'race_p3', label: 'Race P3' },
      { value: 'pole', label: 'Pole Position' },
      { value: 'sprint_p1', label: 'Sprint P1' },
      { value: 'sprint_p2', label: 'Sprint P2' },
      { value: 'sprint_p3', label: 'Sprint P3' },
      { value: 'fastest_lap', label: 'Fastest Lap' },
    ],
    CRICKET: [
      { value: 'match_winner', label: 'Match Winner' },
      { value: 'toss_winner', label: 'Toss Winner' },
    ],
    FOOTBALL: [
      { value: 'match_winner', label: 'Match Winner' },
    ],
  };

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, arrowBackOutline, settingsOutline, addOutline, trashOutline });
    const key = this.api.getAdminKey();
    if (!key) this.router.navigateByUrl('/admin-login');
  }

  get availableMarketTypes() {
    return this.marketTypesBySport[this.sport] || [];
  }

  get availableTeams() {
    return this.teamsBySport[this.sport] || [];
  }

  get isTeamSport(): boolean {
    return this.sport === 'CRICKET' || this.sport === 'FOOTBALL';
  }

  get team1Options() {
    return this.availableTeams.filter(t => t.value !== this.team2);
  }

  get team2Options() {
    return this.availableTeams.filter(t => t.value !== this.team1);
  }

  onSportChange() {
    this.markets.forEach(m => m.type = '');
    this.team1 = '';
    this.team2 = '';
  }

  addMarket() {
    this.markets.push({ type: '', multiplier: null, cutoffAt: '' });
  }

  removeMarket(i: number) {
    this.markets.splice(i, 1);
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.sport || !this.name.trim() || !this.startsAt) {
      this.errorMessage = 'Fill in sport, name and start time';
      return;
    }

    if (this.isTeamSport && (!this.team1 || !this.team2)) {
      this.errorMessage = 'Select both teams for this event';
      return;
    }

    if (this.isTeamSport && this.team1 === this.team2) {
      this.errorMessage = 'Team 1 and Team 2 must be different';
      return;
    }

    if (this.markets.length === 0) {
      this.errorMessage = 'Add at least one market';
      return;
    }

    for (const m of this.markets) {
      if (!m.type || !m.multiplier || !m.cutoffAt) {
        this.errorMessage = 'Fill in all market fields';
        return;
      }
    }

    this.loading = true;
    this.api.adminCreateEvent(this.sport, this.name.trim(), this.startsAt).subscribe({
      next: (res: any) => {
        const eventId = res.event.id;
        const payload = this.markets.map(m => ({
          type: m.type,
          multiplier: m.multiplier,
          cutoff_at: m.cutoffAt,        
        }));
        this.api.adminCreateMarkets(eventId, payload, this.team1, this.team2).subscribe({
          next: () => {
            this.loading = false;
            this.successMessage = 'Event and markets created!';
            setTimeout(() => this.router.navigateByUrl('/admin'), 1500);
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'Event created but failed to add markets';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to create event';
      }
    });
  }

  goAdmin() { this.router.navigateByUrl('/admin'); }
  logout() { this.api.clearAdminKey(); this.router.navigateByUrl('/admin-login'); }
}