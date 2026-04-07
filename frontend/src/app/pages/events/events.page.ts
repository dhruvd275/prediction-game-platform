import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, flagOutline, calendarOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class EventsPage implements OnInit {

  allEvents: any[] = [];
  events: any[] = [];
  loading = true;
  errorMessage = '';
  filter: 'all' | 'upcoming' | 'past' = 'upcoming';
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

  setFilter(filter: 'all' | 'upcoming' | 'past') {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter() {
    const now = new Date();
    if (this.filter === 'all') {
      this.events = this.allEvents;
    } else if (this.filter === 'upcoming') {
      this.events = this.allEvents.filter(e => new Date(e.starts_at) > now);
    } else {
      this.events = this.allEvents.filter(e => new Date(e.starts_at) <= now);
    }
  }

  openMarkets(eventId: number) {
    this.router.navigateByUrl(`/events/${eventId}/markets`);
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  goEvents() {
    this.router.navigateByUrl('/events');
  }

  goHistory() {
    this.router.navigateByUrl('/history');
  }

  goCreditLog() {
    this.router.navigateByUrl('/credit-log');
  }

  goLeaderboard() {
    this.router.navigateByUrl('/leaderboard');
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}