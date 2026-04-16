import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, flagOutline, calendarOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class EventsPage implements OnInit {

  allEvents: any[] = [];
  events: any[] = [];
  loading = true;
  errorMessage = '';
  timeFilter: 'all' | 'upcoming' | 'past' = 'upcoming';
  sportFilter: 'all' | 'F1' | 'CRICKET' | 'FOOTBALL' = 'all';
  menuOpen = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, menuOutline, flagOutline, calendarOutline, timeOutline });
  }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.errorMessage = '';
    this.api.getEvents().subscribe({
      next: (res: any) => {
        this.allEvents = res.events || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load events. Please try again.';
      }
    });
  }

  setSportFilter(sport: 'all' | 'F1' | 'CRICKET' | 'FOOTBALL') {
    this.sportFilter = sport;
    this.applyFilter();
  }

  applyFilter() {
    const now = new Date();
    let result = [...this.allEvents];

    if (this.timeFilter === 'upcoming') {
      result = result.filter(e => new Date(e.starts_at) > now);
    } else if (this.timeFilter === 'past') {
      result = result.filter(e => new Date(e.starts_at) <= now);
    }

    if (this.sportFilter !== 'all') {
      result = result.filter(e => e.sport === this.sportFilter);
    }

    this.events = result;
  }

  openMarkets(eventId: number) {
    this.router.navigateByUrl(`/events/${eventId}/markets`);
  }

  goHome() { this.router.navigateByUrl('/home'); }
  goEvents() { this.router.navigateByUrl('/events'); }
  goHistory() { this.router.navigateByUrl('/history'); }
  goCreditLog() { this.router.navigateByUrl('/credit-log'); }
  goLeaderboard() { this.router.navigateByUrl('/leaderboard'); }
  toggleMenu() { this.menuOpen = !this.menuOpen; }
  logout() { this.api.clearToken(); this.router.navigateByUrl('/login'); }
}