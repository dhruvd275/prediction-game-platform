import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, flagOutline, trophyOutline, chevronForward } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements ViewWillEnter {

  user: any = null;
  stats: any = null;
  upcomingEvents: any[] = [];
  topPlayers: any[] = [];
  menuOpen = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, menuOutline, flagOutline, trophyOutline, chevronForward });
  }

  ionViewWillEnter() {
    this.menuOpen = false;
    this.loadUser();
    this.loadStats();
    this.loadUpcomingEvents();
    this.loadTopPlayers();
  }

  loadUser() {
    const token = this.api.getToken();
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.api.me().subscribe({
      next: (res) => {
        this.user = res.user;
      },
      error: () => {
        this.api.clearToken();
        this.router.navigateByUrl('/login');
      }
    });
  }

  loadStats() {
    this.api.myStats().subscribe({
      next: (res: any) => {
        this.stats = res.stats;
      },
      error: () => {}
    });
  }

  loadUpcomingEvents() {
    this.api.getEvents().subscribe({
      next: (res: any) => {
        const now = new Date();
        this.upcomingEvents = (res.events || [])
          .filter((e: any) => new Date(e.starts_at) > now)
          .slice(0, 3);
      },
      error: () => {}
    });
  }

  loadTopPlayers() {
    this.api.getLeaderboard().subscribe({
      next: (res: any) => {
        this.topPlayers = (res.leaderboard || []).slice(0, 5);
      },
      error: () => {}
    });
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

  openMarkets(eventId: number) {
    this.router.navigateByUrl(`/events/${eventId}/markets`);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}